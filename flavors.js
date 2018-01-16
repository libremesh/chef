flavors = {}
flavors["openwrt_vanilla"] = ["plain OpenWrt", "luci"]
flavors["openwrt_ssl"] = ["plain OpenWrt with SSL", "luci-ssl"]
flavors["lime_default"] = ["full LibreMesh", "lime-full -dnsmasq"]
flavors["lime_mini"] = ["LibreMesh without OPKG", "lime-basic -opkg -wpad-mini hostapd-mini -kmod-usb-core -kmod-usb-ledtrig-usbport -kmod-usb2 -ppp -dnsmasq -ppp-mod-pppoe -6relayd -odhcp6c -odhcpd -iptables -ip6tables"]
flavors["lime_zero"] = ["LibreMesh without web interface", "lime-basic-no-ui -wpad-mini hostapd-mini -ppp -dnsmasq -ppp-mod-pppoe -6relayd -odhcp6c -odhcpd -iptables -ip6tables"]

