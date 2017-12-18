function $(s) {
	return document.getElementById(s.substring(1));
}

function show(s) {
	$(s).style.display = 'block';
}

function hide(s) {
	$(s).style.display = 'none';
}

function toggle(s) {
	if($(s).style.display == 'none') {
		show(s)
	} else {
		hide(s)
	}
}

function toggle_image_packages() {
	toggle("#packages_box");
}

function load_image_info() {
	data.image = {}
	var xmlhttp = new XMLHttpRequest();
	var request_url = server + "/api/image/" + location.hash.substring(1);
	xmlhttp.open("GET", request_url, true);
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			image_info_results(xmlhttp);
		}
	}
	xmlhttp.send();

	function image_info_results(xmlhttp) {
		data.image = JSON.parse(xmlhttp.responseText);
		for (var key in data.image) {
			if($("#image_" + key)) {
				$("#image_" + key).innerHTML = data.image[key]
			}
		}
		load_installed_packages();
	}
}

function load_installed_packages() {
	$("#packages_box").innerHTML = ""
	var xmlhttp = new XMLHttpRequest();
	var request_url = server + "/api/manifest/" + data.image.manifest_hash;
	xmlhttp.open("GET", request_url, true);
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			image_info_results(xmlhttp);
		}
	}
	xmlhttp.send();

	function image_info_results(xmlhttp) {
		data.image.packages = JSON.parse(xmlhttp.responseText);
		$("#installed_packages").innerHTML = "Installed packages (" + Object.keys(data.image.packages).length + ")"
		var list = document.createElement('ul');
		for (var name in data.image.packages) {
			var item = document.createElement('li');
			item.innerHTML = "<b>" + name + "</b> - " + data.image.packages[name] + "</br>"
			list.appendChild(item)
		}
		$("#packages_box").appendChild(list);
	}
}

function translate() {
	config.language = $("#lang").value;
	var xmlhttp = new XMLHttpRequest();
	console.log("request lang " + config.language)
	xmlhttp.open("GET", "i10n/" + config.language + ".json", true);
	xmlhttp.setRequestHeader("Content-type", "application/json");

	xmlhttp.onload = function() {
		translations[config.language] = JSON.parse(xmlhttp.responseText);
		var mapping = translations[config.language];
		for (var id in mapping) {
			var elements = document.getElementsByClassName(id);
			for (var i in elements) {
				if (elements.hasOwnProperty(i)) {
					elements[i].innerHTML = mapping[id];
				}
			}
		}
	}
	xmlhttp.send(null);
};

function tr(id) {
	var mapping = translations[config.language];
	if (id in mapping) {
		return mapping[id];
	} else {
		console.log('Missing translation of token "' + id + '" (' + config.language + ')');
		return id;
	}
}

var delay_timer;
function search_delayed() {
	clearTimeout(delay_timer);
	delay_timer = setTimeout(search, 500);
}

function search() {
	var device = $("#search_device").value;
	if(device.length < 3) { return }

	var distro = $("#distro").value;
	var release = $("#release").value;

	request_url = server + "/api/models?model_search=" + device + "&distro=" + distro + "&release=" + release

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", request_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			device_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function device_results(xmlhttp) {
		devices = JSON.parse(xmlhttp.responseText)
		document.request_form.profile.options.length = 0;
		if(devices.length == 0) {
			document.request_form.btn_create.disabled = true;
			document.request_form.btn_edit_packages.disabled = true;
			document.request_form.profile[0] = new Option("Not found")
		} else {
			document.request_form.btn_create.disabled = false;
			document.request_form.btn_edit_packages.disabled = false;
			for(var i = 0; i < devices.length; i++) {
				if(document.request_form.advanced_view.checked || devices[i].model == "Generic") {
					document.request_form.profile[i] = new Option(devices[i].model + " (" + devices[i].target + "/" +devices[i].subtarget + "/" + devices[i].profile + ")")
				} else {
					document.request_form.profile[i] = new Option(devices[i].model)
				}
				document.request_form.profile[i].value = devices[i].target + "/" + devices[i].subtarget + "/" + devices[i].profile
			}
		}
		load_default_packages();
		set_device_info();
	}
};

function load_distros() {
	var xmlhttp = new XMLHttpRequest();
	request_url = server + "/api/distros";

	xmlhttp.open("GET", request_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			distros_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function distros_results(xmlhttp) {
		distros = JSON.parse(xmlhttp.responseText);
		document.request_form.distro.options.length = 0;

		var default_distro_index = 0;
		for(var i = 0; i < distros.length; i++) {
			var distros_length = document.request_form.distro.length;
			document.request_form.distro[distros_length] = new Option(distros[i].name)
			document.request_form.distro[distros_length].value = distros[i].name
			document.request_form.distro[distros_length].innerHTML = distros[i].alias
			if(distros[i].name === default_distro) {
				default_distro_index = i;
			}
		}
		document.request_form.distro.selectedIndex = default_distro_index;
		load_releases();
	}
};

function load_flavors() {
	for(flavor in flavors) {
		flavors_length = document.request_form.flavor.length;
		document.request_form.flavor[flavors_length] = new Option(flavor)
		document.request_form.flavor[flavors_length].value = flavor
		document.request_form.flavor[flavors_length].innerHTML = flavors[flavor][0]
	}
}

function set_packages_flavor() {
	packages_flavor = flavors[document.request_form.flavor.value][1].split(" ");
	if (typeof packages == 'undefined') {
		load_default_packages();
	} else {
		edit_packages_update();
	}
}

function profile_changed() {
	set_device_info();
	load_default_packages();
}

function get_distro_releases(distro) {
	var distro_releases = []
	for(var i = 0; i < releases.length; i++) {
		if(releases[i].distro == distro) {
			distro_releases[distro_releases.length] = releases[i].release
		}
	}
	return distro_releases
}

function load_network_profiles() {
	var xmlhttp = new XMLHttpRequest();
	request_url = "https://repo.libremesh.org/network-profiles/Packages";

	xmlhttp.open("GET", request_url, true);
	xmlhttp.overrideMimeType("text/plain")

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			network_profiles_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function network_profiles_results(xmlhttp) {
		var network_profiles = xmlhttp.responseText.split("\n");

		for(var i = 0; i < network_profiles.length; i++) {
			if (network_profiles[i].startsWith("Package: ")) {
				var network_profile = network_profiles[i].substring(9) // remove leading "Package: "
				var network_profiles_length = document.request_form.network_profile.length;
				document.request_form.network_profile[network_profiles_length] = new Option(network_profile.substr(3)) // remove leading "np-"
				document.request_form.network_profile[network_profiles_length].value = network_profile
			}
		}
	}
};

function load_releases() {
	var xmlhttp = new XMLHttpRequest();
	var device = $("#search_device").value;
	var distro = $("#distro").value;
	//var release = $("#release").value;

	request_url = server + "/api/releases"

	xmlhttp.open("GET", request_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			releases_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function releases_results(xmlhttp) {
		releases = JSON.parse(xmlhttp.responseText);
		distro_changed();
	}
};

function set_device_info() {
	profile_split = document.request_form.profile.value.split("/");
	target = profile_split[0]
	subtarget = profile_split[1]
	profile = profile_split[2]
}

function load_default_packages() {
	var xmlhttp = new XMLHttpRequest();
	var device = $("#search_device").value;
	var distro = $("#distro").value;
	var release = $("#release").value;
	set_device_info()
	if(typeof target != 'undefined' && typeof subtarget != 'undefined' && typeof profile != 'undefined') {

		request_url = server + "/api/default_packages?distro=" + distro + "&release=" + release + "&target=" + target + "&subtarget=" + subtarget+ "&profile=" + profile

		xmlhttp.open("GET", request_url, true);

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				packages_image_results(xmlhttp);
			}
		}
		xmlhttp.send(null);
	} else {
		packages_image = [];
		edit_packages_update();
	}

	function packages_image_results(xmlhttp) {
		packages_image = diff_packages(JSON.parse(xmlhttp.responseText).packages);
		edit_packages_update();
	}
};

function edit_packages_update() {
	if (packages_flavor != []) {
		packages = diff_packages(packages_image.concat(packages_flavor))
	} else {
		packages = packages_image.slice()
	}
	if (document.request_form.network_profile.value != "") {
		packages[packages.length] = document.request_form.network_profile.value
	}
	document.request_form.edit_packages.value = packages.join("\n");
}

function packages_input() {
	load_default_packages();
	show("#edit_packages_div")
}

function diff_packages(packages_diff) {
	packages_remove = [];
	packages_install = [];
	for (var i = 0; i < packages_diff.length; i++) {
		if (packages_diff[i].startsWith("-")) {
			packages_remove.push(packages_diff[i]);
		} else {
			packages_install.push(packages_diff[i]);
		}
	}
	for (var j = 0; j < packages_remove.length; j++) {
		package_index = packages_install.indexOf(packages_remove[j].substring(1))
		if(package_index != -1) {
			packages_install.splice(package_index, 1);
		}
	}
	return(packages_install)
}

function distro_changed() {
	var distro_releases = get_distro_releases(document.request_form.distro[document.request_form.distro.selectedIndex].value)
	$("#release_div").innerHTML = ""
	if (document.request_form.advanced_view.checked) {
		var releases_select = document.createElement("select")
		releases_select.id = "release"
		releases_select.classList = "custom-select"
		for(var i = 0; i < distro_releases.length; i++) {
			releases_select[releases_select.length] = new Option(distro_releases[i])
		}
		$("#release_div").appendChild(releases_select)
	} else {
		releases_text = document.createElement("input")
		releases_text.type = "text"
		releases_text.readOnly = true
		releases_text.classList = "form-control-plaintext"
		releases_text.id = "release"
		releases_text.value = distro_releases[0]
		$("#release_div").appendChild(releases_text)
	}

	if(document.request_form.distro[document.request_form.distro.selectedIndex].value === "lime") {
		show("#lime_config");
		document.request_form.flavor.selectedIndex = 2; // lime_default
		flavor = "lime_default";
	}  else {
		hide("#lime_config");
		document.request_form.flavor.selectedIndex = 0; // None
		flavor = "";
		packages_flavor = []
		packages = []
	}
	set_packages_flavor();
	search();
}

function create() {
	data = {}
	hide("#download_factory_div");
	hide("#download_box");
	$("#files_box").innerHTML = "Advanced view";
	hide("#info_box");
	hide("#error_box");
	packages = [];
	delete hash
	edit_packages_split = document.request_form.edit_packages.value.replace(/ /g, "\n").split("\n")
	for(var i = 0; i < edit_packages_split.length; i++) {
		package_trimmed = edit_packages_split[i].trim()
		if (package_trimmed != "") {
			packages.push(package_trimmed)
		}
	}
	request_dict = {}
	request_dict.distro = document.request_form.distro.value;
	request_dict.version = document.request_form.release.value;
	profile_split = document.request_form.profile.value.split("/");
	request_dict.target = profile_split[0]
	request_dict.subtarget = profile_split[1]
	request_dict.board = profile_split[2]
	if (packages != "") {
		request_dict.packages = packages
	}
	var shaObj = new jsSHA("SHA-256", "TEXT");
	pkg_hash_sort = packages.sort()
	shaObj.update(pkg_hash_sort.join(" "))
	pkg_hash = shaObj.getHash("HEX").substring(0, 12);
	hash_string = [request_dict.distro, request_dict.version,request_dict.target, request_dict.subtarget, request_dict.board, pkg_hash, ""].join(" ")
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update(hash_string)
	hash = shaObj.getHash("HEX").substring(0, 12);
	image_request()
}

function toggle_advanced_view() {
	search(); // run search to redraw target/subtarget/profile combi or hide it
	if (document.request_form.advanced_view.checked) {
		action = "block"
	} else {
		action = "none"

	}
	var advanced_elements = document.querySelectorAll(".advanced_view");
	for(var i = 0; i < advanced_elements.length; i++) {
		advanced_elements[i].style.display = action;
	}
}

function bootstrap() {
	data = {}
	if(location.hash != "") {
		hash = location.hash.substring(1)
		image_request()
	}
	packages_flavor = ""
	load_distros();
	load_network_profiles();
	load_flavors();
	toggle_advanced_view();
}


// shows notification if update is available
function info_box(info_output) {
	$("#info_box").innerHTML = info_output;
	show("#info_box");
}

function error_box(error_output) {
	hide("#info_box");
	show("#error_box");
	$("#error_box").innerHTML = error_output;
}

// requests to the update server
function server_request(request_dict, path, callback) {
	var url = server + "/" + path
	var xmlhttp = new XMLHttpRequest();
	if(request_dict != "") {
		method = "POST"
	} else {
		method = "GET"
	}
	xmlhttp.open(method, url, true);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	xmlhttp.onerror = function(e) {
		error_box(tr("tr-server-down"))
	};
	xmlhttp.onload = function () {
		callback(xmlhttp)
	};
	xmlhttp.send(JSON.stringify(request_dict));
}

function image_request() {
	if(typeof hash != 'undefined') {
		server_request("", "api/build-request/" + hash, image_request_handler)
	} else {
		server_request(request_dict, "api/build-request", image_request_handler)
	}
}

function image_request_handler(response) {
	var response_content = JSON.parse(response.responseText)
	hash = response_content.request_hash
	if (response.status === 400) {
		error_box_content = response_content.error
		if('log' in response_content) {
			error_box_content += ' <a href="' + response_content.log + '">Build log</a>'
		}
		error_box(error_box_content)
	} else if (response.status === 404) {
		delete hash;
		image_request();
	} else if (response.status === 412) {
		// this is a bit generic
		error_box(tr("tr-unsupported"))
	} else if (response.status === 413) {
		error_box(tr("tr-filesize"))
	} else if (response.status === 422) {
		var package_missing = response.getResponseHeader("X-Unknown-Package");
		error_box(tr("tr-unknown-package") + ": <b>" + package_missing + "</b>")
	} else if (response.status === 501) {
		error_box(tr("tr-no-sysupgrade"))
	} else if (response.status === 500) {
		error_box_content = response_content.error
		if('log' in response_content) {
			error_box_content += ' <a href="' + response_content.log + '">' + tr("tr-buildlog") + '</a>'
		}
		error_box(error_box_content)
	} else if (response.status === 503) {
		error_box(tr("tr-overload"))
		// handle overload
		setTimeout(image_request, 30000)
	} else if (response.status === 202) {
		var imagebuilder = response.getResponseHeader("X-Imagebuilder-Status");
		if(imagebuilder === "queue") {
			// in queue
			var queue = response.getResponseHeader("X-Build-Queue-Position");
			info_box(tr("tr-queue-position"))
			console.log("queued");
		} else if(imagebuilder === "initialize") {
			info_box(tr("tr-initialize-imagebuilder"));
			console.log("Setting up imagebuilder");
		} else if(imagebuilder === "building") {
			info_box(tr("tr-building"));
			console.log("building");
		} else {
			info_box("Processing request"); // should never be shown
			console.log(imagebuilder)
		}
		setTimeout(image_request, 5000);

	} else if (response.status === 200) {
		// ready to download
		files_url = response_content.files
		load_files();
		hide("#info_box");
		show("#download_box");

		if("sysupgrade" in response_content) {
			$("#download_sysupgrade").setAttribute('href', response_content.sysupgrade)
			show("#download_sysupgrade_div");
		} else {
			hide("#download_sysupgrade_div");
		}
		$("#download_build_log").setAttribute('href', response_content.log)
		location.hash = response_content.image_hash
		load_image_info()
	}
}

function load_files() {
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.open("GET", files_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			releases_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function releases_results(xmlhttp) {
		var response_content = JSON.parse(xmlhttp.responseText);
		files_box = $("#files_box")
		files_box.innerHTML = "</br><h5>Created files</h5>"
		var list = document.createElement('ul');

		var factory_files = []
		for(var i = 0; i < response_content.length; i++) {
			var item = document.createElement('li');
			var link = document.createElement('a');
			if(response_content[i].name.includes("factory")) {
				factory_files[factory_files.length] = response_content[i].name
			}
			link.href = files_url + response_content[i].name
			link.innerHTML = response_content[i].name
			item.appendChild(link)
			list.appendChild(item);
		}
		if(factory_files.length == 1) {
			data.factory = files_url + factory_files[0]
			$("#download_factory").setAttribute('href', data.factory)
			show("#download_factory_div");
			if (!document.request_form.advanced_view.checked) {
				hide("#files_box");
			}
		} else {
			data.factory = ""
			hide("#download_factory_div");
			show("#files_box");
		}
		files_box.appendChild(list);
	}
}

translations = {};
config = {};
translate();

// so here it begins
window.onload = bootstrap;
