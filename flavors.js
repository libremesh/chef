flavors = {}
flavors["openwrt_vanilla"] = ["plain OpenWrt", "luci"]
flavors["openwrt_ssl"] = ["plain OpenWrt with SSL", "luci-ssl"]
flavors["lime_default"] = ["full LibreMesh", "lime-full -dnsmasq"]
flavors["lime_mini"] = ["LibreMesh without OPKG", "lime-basic -opkg -wpad-mini hostapd-mini -kmod-usb-core -kmod-usb-ledtrig-usbport -kmod-usb2 -ppp -dnsmasq -ppp-mod-pppoe -odhcp6c -odhcpd -iptables -ip6tables"]
flavors["lime_zero"] = ["LibreMesh without web interface", "lime-basic-no-ui -wpad-mini hostapd-mini -ppp -dnsmasq -ppp-mod-pppoe -odhcp6c -odhcpd -iptables -ip6tables"]
flavors["meshrc_node"] = ["LibreMesh flavor for meshrc node", "lime-system bmx7 bmx7-iwinfo lime-proto-bmx7 -ppp -ppp-mod-pppoe -odhcpd"]

