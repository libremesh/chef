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
        $("#packages_count").innerHTML = "(" + Object.keys(data.image.packages).length + ")"
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
    xmlhttp.open("GET", "i18n/" + config.language + ".json", true);
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
    var version = $("#version").value;

    request_url = server + "/api/models?model_search=" + device + "&distro=" + distro + "&version=" + version

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", request_url, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            device_results(xmlhttp);
        }
    }
    xmlhttp.send(null);

    function device_results(xmlhttp) {
        data.devices = JSON.parse(xmlhttp.responseText)
        redraw_devices();
        load_default_packages();
        set_device_info();
    }
};

function redraw_devices() {
  if(data.devices) {
    var selected_device = $("#profile").selectedIndex
    $("#profile").options.length = 0;
    if(data.devices.length == 0) {
      $("#btn_create").disabled = true;
      $("#btn_edit_packages").disabled = true;
      $("#profile")[0] = new Option("Not found")
    } else {
      $("#btn_create").disabled = false;
      $("#btn_edit_packages").disabled = false;
      for(var i = 0; i < data.devices.length; i++) {
        $("#profile")[i] = new Option(data.devices[i].model)
        $("#profile")[i].value = data.devices[i].target + "/" + data.devices[i].subtarget + "/" + data.devices[i].profile
      }
      $("#profile").selectedIndex = selected_device;
    }
  }
}

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
        $("#distro").options.length = 0;

        for(var i = 0; i < distros.length; i++) {
            var distros_length = $("#distro").length;
                var opt = document.createElement("option");
                opt.value= distros[i].name;
                opt.innerHTML = distros[i].alias
                opt.desc = distros[i].description
                opt.latest = distros[i].latest
                $("#distro").appendChild(opt);
        }
        $("#distro").value = default_distro;
        load_versions();
    }

};

function load_flavors() {
    $("#flavor").options.length = 0;
    if (flavors[$("#distro").value]) {
        show("#flavor_div")
        for(flavor in flavors[$("#distro").value]) {
            var opt = document.createElement("option");
            opt.value= flavor
            opt.innerHTML = flavors[$("#distro").value][flavor][0]
            $("#flavor").appendChild(opt);
        }
    } else {
        hide("#flavor_div")
    }
}

function set_packages_flavor() {
    packages_flavor = flavors[$("#distro").value][$("#flavor").value][1].split(" ");
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

function get_distro_versions(distro) {
    var distro_versions = []
    for(var i = 0; i < versions.length; i++) {
        if(versions[i].distro == distro) {
            distro_versions[distro_versions.length] = versions[i].version
        }
    }
    return distro_versions
}

function load_network_profiles() {
    var xmlhttp = new XMLHttpRequest();
    request_url = server + "/network-profiles/Packages";

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
                var network_profiles_length = $("#network_profile").length;
                $("#network_profile")[network_profiles_length] = new Option(network_profile);
                $("#network_profile")[network_profiles_length].value = network_profile;
            }
        }
        $("#network_profile").value = default_profile;
    }
};

function load_versions() {
    var xmlhttp = new XMLHttpRequest();
    var device = $("#search_device").value;
    var distro = $("#distro").value;
    //var version = $("#version").value;

    request_url = server + "/api/versions"

    xmlhttp.open("GET", request_url, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            versions_results(xmlhttp);
        }
    }
    xmlhttp.send(null);

    function versions_results(xmlhttp) {
        versions = JSON.parse(xmlhttp.responseText);
        distro_changed();
    }
};

function set_device_info() {
    profile_split = $("#profile").value.split("/");
    target = profile_split[0]
    subtarget = profile_split[1]
    profile = profile_split[2]
}

function load_default_packages() {
    var xmlhttp = new XMLHttpRequest();
    var device = $("#search_device").value;
    var distro = $("#distro").value;
    var version = $("#version").value;
    set_device_info()
    if(typeof target != 'undefined' && typeof subtarget != 'undefined' && typeof profile != 'undefined') {

        request_url = server + "/api/default_packages?distro=" + distro + "&version=" + version + "&target=" + target + "&subtarget=" + subtarget+ "&profile=" + profile

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
        packages_image = JSON.parse(xmlhttp.responseText).packages;
        edit_packages_update();
    }
};

function edit_packages_update() {
    packages = packages_image.concat(packages_flavor)
    if ($("#network_profile").value != "" && $("#distro").value == "lime") {
        packages[packages.length] = $("#network_profile").value
    }
    $("#edit_packages").value = packages.join("\n");
}

function packages_input() {
    load_default_packages();
    show("#edit_packages_div")
}

function distro_changed() {
    var distro_versions = get_distro_versions($("#distro").value)
    $("#version").options.length = 0;

    for(var i = 0; i < distro_versions.length; i++) {
        $("#version")[$("#version").length] = new Option(distro_versions[i])
    }

    if ($("#distro").latest != "") {
        $("#version").value = $("#distro")[$("#distro").selectedIndex].latest
    }

    if ($("#distro").desc != "") {
        $("#distro_desc").innerHTML = $("#distro")[$("#distro").selectedIndex].desc
    } else {
        $("#distro_desc").innerHTML = ""
    }

    if($("#distro").value === "lime") {
        show("#lime_config");
        $("#flavor").value = "lime_default"
    }  else {
        hide("#lime_config");
        $("#flavor").value = ""
    }
    load_flavors();
    set_packages_flavor();
    search();
}

function create() {
    last_position = null;
    queue_counter = 0;
    data = {}
    hide("#download_factory_div");
    hide("#download_box");
    hide("#info_box");
    hide("#error_box");
    packages = [];
    delete hash
    location.hash = ""
    edit_packages_split = $("#edit_packages").value.replace(/ /g, "\n").split("\n")
    for(var i = 0; i < edit_packages_split.length; i++) {
        package_trimmed = edit_packages_split[i].trim()
        if (package_trimmed != "") {
            packages.push(package_trimmed)
        }
    }
    request_dict = {}
    request_dict.distro = $("#distro").value;
    request_dict.version = $("#version").value;
    profile_split = $("#profile").value.split("/");
    request_dict.target = profile_split[0]
    request_dict.subtarget = profile_split[1]
    request_dict.board = profile_split[2]
    request_dict.defaults = $("#edit_defaults").value
    if (packages != "") {
        request_dict.packages = packages
    }
	image_request()
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
            var position = response.getResponseHeader("X-Build-Queue-Position");
            if (position === null) {
                if (position === last_position) {
                    queue_counter += 1;
                }
                if (queue_counter < 30) {
                    info_box(tr("tr-queue"))
                } else {
                    error_box(tr("tr-queue-error"))
                    return;
                }
            } else {
                info_box(tr("tr-queue") + ". " + tr("tr-position") + ": " + position)
            }
        } else if(imagebuilder === "building") {
            info_box(tr("tr-building"));
        } else {
            info_box("Processing request"); // should never be shown
            console.log(imagebuilder)
        }
        setTimeout(image_request, 5000);

    } else if (response.status === 200) {
        // ready to download
        files_url = response_content.files + '/'
        load_files();
        hide("#info_box");
        show("#download_box");

        if("sysupgrade" in response_content) {
            $("#download_sysupgrade").setAttribute('href', response_content.sysupgrade)
            show("#download_div");
        } else {
            hide("#download_div");
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
            versions_results(xmlhttp);
        }
    }
    xmlhttp.send(null);

    function versions_results(xmlhttp) {
        var response_content = JSON.parse(xmlhttp.responseText);
        $("#files_count").innerHTML = " (" + response_content.length + ")"
        files_box = $("#files_box")
        files_box.innerHTML = ""
        var list = document.createElement('ul');

        var factory_files = []
        for(var i = 0; i < response_content.length; i++) {
            var item = document.createElement('li');
            var link = document.createElement('a');
            if(response_content[i].name.includes("factory")) {
                factory_files[factory_files.length] = response_content[i].name
            }
            link.href = files_url + "/" + response_content[i].name
            link.innerHTML = response_content[i].name
            item.appendChild(link)
            list.appendChild(item);
        }
        if(factory_files.length == 1) {
            data.factory = files_url + "/" + factory_files[0]
            $("#download_factory").setAttribute('href', data.factory)
            show("#download_factory_div");
        } else {
            data.factory = ""
            hide("#download_factory_div");
        }
        files_box.appendChild(list);
    }
}

translations = {};
config = {};
translate();

// so here it begins
window.onload = bootstrap;
