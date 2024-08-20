import {Plugin, PluginConfigService} from "@wocker/core";

import {DnsController} from "./controllers/DnsController";
import {DnsService} from "./services/DnsService";
import {LocalTunnelService} from "./services/LocalTunnelService";
import {NgrokService} from "./services/NgrokService";
import {ServeoService} from "./services/ServeoService";


@Plugin({
    name: "dns",
    controllers: [DnsController],
    providers: [
        PluginConfigService,
        DnsService,
        LocalTunnelService,
        NgrokService,
        ServeoService
    ]
})
export default class DnsPlugin {}
