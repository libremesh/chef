function $(s) {
    return document.getElementById(s.substring(1));
}

function $$(s) {
    return document.getElementById(s.substring(1)).value;
}

function show(s) {
    $(s).style.display = 'block';
}

function inline(s) {
    $(s).style.display = 'inline';
}

function hide(s) {
    $(s).style.display = 'none';
}

function toggle(s) {
    if ($(s).style.display == 'none') {
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
    fetch(server + "/api/image/" + data.image_hash)
        .then(response => response.json())
        .then(function(image_info) {
            data.image = image_info
            if (data.image.snapshots) {
                inline("#unstable_warning")
            }
            if (data.image.defaults_hash) {
                inline("#custom_info")
            }
            for (var key in data.image) {
                if ($("#image_" + key)) {
                    if (key == 'build_date') {
                        $("#image_build_date").innerHTML = data.image[key].substring(0, 10)
                    } else {
                        $("#image_" + key).innerHTML = data.image[key]
                    }
                }
            }
            load_manifest();
        });
}

function load_manifest() {
    $("#packages_box").innerHTML = ""
    fetch(server + "/api/manifest/" + data.image.manifest_hash)
        .then(response => response.json())
        .then(function(manifest) {
            $("#packages_count").innerHTML = "(" + Object.keys(manifest).length + ")"
            var list = document.createElement('ul');
            Object.keys(manifest).sort().map(function(name) {
                var item = document.createElement('li');
                item.innerHTML = "<b>" + name + "</b> - " + manifest[name] + "</br>"
                list.appendChild(item)
            })
            $("#packages_box").appendChild(list);
        });
}

function translate() {
    config.language = $("#lang").value;
    fetch("i18n/" + config.language + ".json")
        .then(response => response.json())
        .then(function(language) {
            translations[config.language] = language;
            var mapping = translations[config.language];
            for (var id in mapping) {
                var elements = document.getElementsByClassName(id);
                for (var i in elements) {
                    if (elements.hasOwnProperty(i)) {
                        elements[i].innerHTML = mapping[id];
                    }
                }
            }
        });
}

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
    if (device.length < 3) {
        return
    }

    request_url = server + "/api/models?model_search=" + device +
        "&distro=" + $$("#distro") + "&version=" + $$("#version")

    fetch(request_url)
        .then(response => response.json())
        .then(function(response) {
            data.devices = response;
            redraw_devices();
            load_default_packages();
            set_device_info();
        });
};

function load_banner() {
    fetch("/banner.html")
        .then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                return "";
            }
        }).then(function(response) {
            $("#banner").innerHTML = response
        });
}

function redraw_devices() {
    if (data.devices) {
        var selected_device = $("#profile").selectedIndex
        $("#profile").options.length = 0;
        if (data.devices.length == 0) {
            $("#btn_create").disabled = true;
            $("#btn_edit_packages").disabled = true;
            $("#profile")[0] = new Option("Not found")
        } else {
            $("#btn_create").disabled = false;
            $("#btn_edit_packages").disabled = false;
            for (var i = 0; i < data.devices.length; i++) {
                $("#profile")[i] = new Option(
                    data.devices[i].model + " (" + data.devices[i].target + ")")
                $("#profile")[i].value = data.devices[i].target + "/" + data.devices[i].profile
            }
            $("#profile").selectedIndex = selected_device;
        }
    }
}

function load_dists() {
    fetch(server + "/api/distributions")
        .then(response => response.json())
        .then(function(response) {
            dists = response;
            for (dist in dists) {
                var dists_length = $("#distro").length;
                var opt = document.createElement("option");
                opt.value = dist;
                opt.innerHTML = dists[dist].distro_alias
                $("#distro").appendChild(opt);
            }
            $("#distro").value = default_distro;
            dist_changed();
        });
}

function load_flavors() {
    $("#flavor").options.length = 0;
    if (flavors[$("#distro").value]) {
        show("#flavor_div")
        for (flavor in flavors[$("#distro").value]) {
            var opt = document.createElement("option");
            opt.value = flavor
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

function load_network_profiles() {
    fetch(server + "/network-profiles/Packages")
        .then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                return "";
            }
        }).then(function(network_profiles) {
            var network_profiles = network_profiles.split("\n")
            for (var i = 0; i < network_profiles.length; i++) {
                if (network_profiles[i].startsWith("Package: ")) {
                    var network_profile = network_profiles[i].substring(9) // remove leading "Package: "
                    var network_profiles_length = $("#network_profile").length;
                    $("#network_profile")[network_profiles_length] = new Option(network_profile);
                    $("#network_profile")[network_profiles_length].value = network_profile;
                }
            }
            $("#network_profile").value = default_profile;
        });
}

function set_device_info() {
    profile_split = $("#profile").value.split("/");
    target = profile_split[0] + "/" + profile_split[1]
    profile = profile_split[2]
}

function load_default_packages() {
    set_device_info()
    var device = $$("#search_device");
    var distro = $$("#distro");
    var version = $$("#version");
    var request_url = server + "/api/packages_image?distro=" + distro + "&version=" + version + "&target=" + encodeURI(target) + "&profile=" + profile
    if (typeof target != 'undefined' && typeof profile != 'undefined') {
        fetch(request_url)
            .then(response => response.json())
            .then(function(packages_image) {
                data.packages_image = packages_image
                edit_packages_update();
            });
    } else {
        data.packages_image = [];
        edit_packages_update();
    }
};

function edit_packages_update() {
    packages = data.packages_image.concat(packages_flavor)
    if ($("#network_profile").value != "" && $("#distro").value == "lime") {
        packages[packages.length] = $("#network_profile").value
    }
    $("#edit_packages").value = packages.join("\n");
}

function packages_input() {
    load_default_packages();
    show("#edit_packages_div")
}

function version_changed() {
    $("#version_desc").innerHTML = dists[$$("#distro")]["versions"][$$("#version")].version_description || ""
    search();
}

function dist_changed() {
    $("#version").options.length = 0;

    for (var version in dists[$$("#distro")].versions) {
        var title = version
        $("#version")[$("#version").length] = new Option(title)
    }

    if (dists[$$("#distro")].latest != "") {
        $("#version").value = dists[$$("#distro")].latest
    }

    $("#distro_desc").innerHTML = dists[$$("#distro")].distro_description || ""

    if ($("#distro").value === "lime") {
        show("#lime_config");
        $("#flavor").value = "lime_default"
    } else {
        hide("#lime_config");
        $("#flavor").value = ""
    }
    load_flavors();
    set_packages_flavor();
    version_changed();
}

function create() {
    last_position = null;
    queue_counter = 0;
    data = {}
    hide("#download_factory_div");
    hide("#download_box");
    hide("#info_box");
    hide("#error_box");
    hide("#unstable_warning");
    hide("#custom_info");
    packages = [];
    delete hash
    location.hash = ""
    edit_packages_split = $("#edit_packages").value.replace(/ /g, "\n").split("\n")
    for (var i = 0; i < edit_packages_split.length; i++) {
        package_trimmed = edit_packages_split[i].trim()
        if (package_trimmed != "") {
            packages.push(package_trimmed)
        }
    }
    request_dict = {}
    request_dict.distro = $("#distro").value;
    request_dict.version = $("#version").value;
    profile_split = $("#profile").value.split("/");
    request_dict.target = profile_split[0] + "/" + profile_split[1]
    request_dict.board = profile_split[2]
    request_dict.profile= profile_split[2]
    request_dict.defaults = $("#edit_defaults").value
    if (packages != "") {
        request_dict.packages = packages
    }
    image_request()
}

function check_maintenance() {
    if (maintenance_message != "") {
        show("#maintenance_box")
        $("#maintenance_message").innerHTML = maintenance_message
    }
}

function bootstrap() {
    check_maintenance();
    data = {}
    if (location.hash != "") {
        hash = location.hash.substring(1)
        image_request()
    }
    packages_flavor = ""
    load_dists();
    load_network_profiles();
    load_image_stats();
    load_banner();
}

function load_image_stats() {
    var request_url = server + "/api/v1/stats/image_stats"
    fetch(request_url)
        .then(response => response.json())
        .then(function(response) {
            $("#images_total").innerHTML = response.total
        });

}

// shows notification if update is available
function info_box(info_output, loading) {
    $("#info_box_content").innerHTML = info_output;
    if (loading) {
        inline("#info_box_loading")
    } else {
        hide("#info_box_loading")
    }
    show("#info_box");
}

function error_box(error_output) {
    hide("#info_box");
    show("#error_box");
    $("#error_box").innerHTML = error_output;
}

// requests to the update server
function server_request(request_dict, path, callback) {
    var url = server + path
    var xmlhttp = new XMLHttpRequest();
    if (request_dict != "") {
        method = "POST"
    } else {
        method = "GET"
    }
    xmlhttp.open(method, url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.onerror = function(e) {
        error_box(tr("tr-server-down"))
    };
    xmlhttp.onload = function() {
        callback(xmlhttp)
    };
    xmlhttp.send(JSON.stringify(request_dict));
}

function image_request() {
    if (typeof hash != 'undefined') {
        server_request("", "/api/build-request/" + hash, image_request_handler)
    } else {
        server_request(request_dict, "/api/build-request", image_request_handler)
    }
}

function image_request_handler(response) {
    var response_content = JSON.parse(response.responseText)
    hash = response_content.request_hash
    if (response.status === 400) {
        error_box_content = response_content.error
        if ('log' in response_content) {
            error_box_content += ' <a target="_blank" href="' + server + response_content.log + '">' + tr("tr-buildlog") + '</a>'
        }
        error_box(error_box_content)
    } else if (response.status === 404) {
        delete hash;
        image_request();
    } else if (response.status === 409) {
        error_box_content = tr("tr-manifest-fail")
        error_box_content += ' <a target="_blank" href="' + server + response_content.log + '">' + tr("tr-buildlog") + '</a>'
        error_box(error_box_content)
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
        if ('log' in response_content) {
            error_box_content += ' <a target="_blank" href="' + server + response_content.log + '">' + tr("tr-buildlog") + '</a>'
        }
        error_box(error_box_content)
    } else if (response.status === 503) {
        error_box(tr("tr-overload"))
        // handle overload
        setTimeout(image_request, 30000)
    } else if (response.status === 202) {
        var imagebuilder = response.getResponseHeader("X-Imagebuilder-Status");
        if (imagebuilder === "queue") {
            var position = response.getResponseHeader("X-Build-Queue-Position");
            if (position === null) {
                info_box(tr("tr-queue"), true)
            } else {
                if (position === last_position) {
                    queue_counter += 1;
                } else {
                    last_position = position;
                    queue_counter = 0;
                }
                if (queue_counter < 30) {
                    info_box(tr("tr-queue") + ". " + tr("tr-position") + ": " + position, true)
                } else {
                    error_box(tr("tr-queue-error"))
                    return;
                }
            }
        } else if (imagebuilder === "building") {
            info_box(tr("tr-building"), true);
        } else {
            info_box("Processing request", true); // should never be shown
            console.log(imagebuilder)
        }
        setTimeout(image_request, 5000);

    } else if (response.status === 200) {
        // ready to download
        data.files = response_content.files
        load_files();
        hide("#info_box");
        show("#download_box");

        if ("sysupgrade" in response_content) {
            $("#download_sysupgrade").setAttribute('href', server + response_content.files + response_content.sysupgrade)
            show("#download_div");
        } else {
            hide("#download_div");
        }
        $("#download_build_log").setAttribute('href', server + response_content.log)
        location.hash = response_content.request_hash
        data.image_hash = response_content.image_hash
        load_image_info();
    }
}

function load_files() {
    fetch(server + data.files)
        .then(response => response.json())
        .then(function(response_content) {
            $("#files_count").innerHTML = " (" + response_content.length + ")"
            var files_box = $("#files_box")
            files_box.innerHTML = ""
            var list = document.createElement('ul');

            var factory_files = []
            for (var i = 0; i < response_content.length; i++) {
                var item = document.createElement('li');
                var link = document.createElement('a');
                if (response_content[i].name.includes("factory")) {
                    factory_files[factory_files.length] = response_content[i].name
                }
                link.href = server + data.files + response_content[i].name
                link.innerHTML = response_content[i].name
                item.appendChild(link)
                list.appendChild(item);
            }
            if (factory_files.length == 1) {
                $("#download_factory").setAttribute('href', server + data.files + factory_files[0])
                show("#download_factory_div");
            } else {
                hide("#download_factory_div");
            }
            files_box.appendChild(list);
        });
}

function request_server_image() {
    request_dict = {}
    request_dict.distro = "openwrt";
    request_dict.version = "18.06.2";
    request_dict.target = "x86/64"
    request_dict.board = "Generic"
    request_dict.defaults = ""
    request_dict.packages = ["bash", "bzip2", "coreutils", "coreutils-stat",
        "diffutils", "file", "gawk", "gcc", "getopt", "git", "libncurses",
        "make", "patch", "perl", "perlbase-attributes", "perlbase-findbin",
        "perlbase-getopt", "perlbase-thread", "python-light", "tar", "unzip",
        "wget", "xz", "xzdiff", "xzgrep", "xzless", "xz-utils", "zlib-dev",
        "gunicorn", "python3-flask", "python3-yaml", "python3-openssl",
        "python3-pyodbc", "python3-ctypes", "python3-distutils"
    ]
    image_request()
}

function request_worker_image() {
    request_dict = {}
    request_dict.distro = "openwrt";
    request_dict.version = "18.06.2";
    request_dict.target = "x86/64"
    request_dict.board = "Generic"
    request_dict.defaults = ""
    request_dict.packages = ["bash", "bzip2", "coreutils", "coreutils-stat",
        "diffutils", "file", "gawk", "gcc", "getopt", "git", "libncurses",
        "make", "patch", "perl", "perlbase-attributes", "perlbase-findbin",
        "perlbase-getopt", "perlbase-thread", "python-light", "tar", "unzip",
        "wget", "xz", "xzdiff", "xzgrep", "xzless", "xz-utils", "zlib-dev"
    ]
    image_request()
}

translations = {};
config = {};
translate();

// so here it begins
window.onload = bootstrap;
