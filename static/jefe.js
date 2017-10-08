server_address = "https://betaupdate.libremesh.org/";

var delay_timer;
function search_delayed() {
	clearTimeout(delay_timer);
	delay_timer = setTimeout(search, 500);
}

function search() {
	var device = document.getElementById("search_device").value;
	if(device === "") { return }

	var distro = document.getElementById("distro").value;
	var release = document.getElementById("release").value;

	request_url = server_address + "api/models?model_search=" + device + "&distro=" + distro + "&release=" + release

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
			document.request_form.profile[0] = new Option("Not found")
		} else {
			for(var i = 0; i < devices.length; i++) {
				document.request_form.profile[i] = new Option(devices[i].model)
				document.request_form.profile[i].value = devices[i].target + "/" + devices[i].subtarget + "/" + devices[i].profile
			}
		}
	}
};

function load_distros() {
	var xmlhttp = new XMLHttpRequest();
	request_url = server_address + "api/distros";

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

		for(var i = 0; i < distros.length; i++) {
			distros_length = document.request_form.distro.length;
			document.request_form.distro[distros_length] = new Option(distros[i].name)
		}
		load_releases();
	}
};

function load_flavors() {
	for(flavor in flavors) {
		flavors_length = document.request_form.flavor.length;
		document.request_form.flavor[flavors_length] = new Option(flavor)
	}
}

function set_flavor_packages() {
	flavor_packages = flavors[document.request_form.flavor.value].split(" ");
	if (typeof packages == 'undefined') {
		load_packages_image();
	} else {
		diff_packages();
	}
}

function load_network_profiles() {
	var xmlhttp = new XMLHttpRequest();
	request_url = server_address + "api/network_profiles";

	xmlhttp.open("GET", request_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			network_profiles_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function network_profiles_results(xmlhttp) {
		network_profiles = JSON.parse(xmlhttp.responseText);

		for(var i = 0; i < network_profiles.length; i++) {
			network_profiles_length = document.request_form.network_profile.length;
			document.request_form.network_profile[network_profiles_length] = new Option(network_profiles[i])
		}
	}
};

function load_releases() {
	var xmlhttp = new XMLHttpRequest();
	var device = document.getElementById("search_device").value;
	var distro = document.getElementById("distro").value;
	var release = document.getElementById("release").value;

	request_url = server_address + "api/releases"

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

function load_packages_image() {
	var xmlhttp = new XMLHttpRequest();
	var device = document.getElementById("search_device").value;
	var distro = document.getElementById("distro").value;
	var release = document.getElementById("release").value;
	profile_split = document.request_form.profile.value.split("/");
    target = profile_split[0]
    subtarget = profile_split[1]
    profile = profile_split[2]

	request_url = server_address + "api/packages_image?distro=" + distro + "&release=" + release + "&target=" + target + "&subtarget=" + subtarget+ "&profile=" + profile

	xmlhttp.open("GET", request_url, true);

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			releases_results(xmlhttp);
		}
	}
	xmlhttp.send(null);

	function releases_results(xmlhttp) {
		packages = JSON.parse(xmlhttp.responseText).packages;
		diff_packages();
	}
};

function diff_packages() {
	for (var i in flavor_packages) {
		if(flavor_packages[i].startsWith("-")) {
			package_index = packages.indexOf(flavor_packages[i].substring(1))
			console.log(package_index)
			if(package_index != -1) {
				packages.splice(package_index, 1);
			}
		} else if(!packages.includes(flavor_packages[i])) {
			packages.push(flavor_packages[i])
		}
	}
	document.request_form.edit_packages.value = packages.join("\n");
}

function distro_changed() {
	document.request_form.release.options.length = 0;

	for(var i = 0; i < releases.length; i++) {
		if(releases[i].distro === document.request_form.distro[document.request_form.distro.selectedIndex].value) {
			release_length = document.request_form.release.length
			document.request_form.release[release_length] = new Option(releases[i].release)
		}
	}
	search();
}

function create() {
	packages = document.request_form.edit_packages.value.split("\n")
	image_request()
}

function bootstrap() {
	load_distros();
	load_network_profiles();
	load_flavors();
}
