flavors = {}
flavors["openwrt"] = {}
flavors["openwrt"]["openwrt_luci"] = ["OpenWrt with web interface", "luci"]
flavors["openwrt"]["openwrt_default"] = ["OpenWrt default packages only", ""]

flavors["lime"] = {}
flavors["lime"]["lime_default"] = ["full LibreMesh", "lime-full -dnsmasq"]
flavors["lime"]["lime_bmx7"] = ["LibreMesh with BMX7", "lime-system lime-proto-wan lime-hwd-openwrt-wan lime-debug smonit lime-proto-bmx7 bmx7-auto-gw-mode luci luci-app-bmx7 bmx7-topology bmx7-json"]
flavors["lime"]["lime_mini"] = ["LibreMesh without OPKG", "lime-basic -opkg -wpad-mini hostapd-mini -kmod-usb-core -kmod-usb-ledtrig-usbport -kmod-usb2 -ppp -dnsmasq -ppp-mod-pppoe -odhcp6c -odhcpd -iptables -ip6tables"]
flavors["lime"]["lime_zero"] = ["LibreMesh without web interface", "lime-basic-no-ui -wpad-mini hostapd-mini -ppp -dnsmasq -ppp-mod-pppoe -odhcp6c -odhcpd -iptables -ip6tables"]
flavors["lime"]["meshrc_node"] = ["LibreMesh flavor for meshrc node", "lime-system bmx7 bmx7-iwinfo lime-proto-bmx7 -ppp -ppp-mod-pppoe -odhcpd"]
