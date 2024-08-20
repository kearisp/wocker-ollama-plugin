import {
    Injectable,
    Project
} from "@wocker/core";
import {promptConfirm, promptSelect} from "@wocker/utils";

import {LocalTunnelService} from "./LocalTunnelService";
import {NgrokService} from "./NgrokService";
import {ServeoService} from "./ServeoService";
import {
    PROXY_ENABLE_KEY,
    PROXY_TYPE_KEY,
    TYPE_LOCAL,
    TYPE_SERVEO,
    TYPE_NGROK,
    TYPE_LT
} from "../env";


@Injectable()
export class DnsService {
    public constructor(
        protected readonly localTunnelService: LocalTunnelService,
        protected readonly ngrokService: NgrokService,
        protected readonly serveoService: ServeoService
    ) {}

    public async onProjectInit(project: Project): Promise<void> {
        await this.init(project);
    }

    public async onProjectStart(project: Project): Promise<void> {
        if(project.getMeta<string>(PROXY_ENABLE_KEY, "false") !== "true") {
            return;
        }

        await this.start(project);
    }

    public async onProjectStop(project: Project): Promise<void> {
        if(project.getMeta<string>(PROXY_ENABLE_KEY, "false") !== "true") {
            return;
        }

        await this.stop(project);
    }

    public async init(project: Project): Promise<void> {
        const enable = await promptConfirm({
            message: "Enable reverse proxy?",
            default: project.getMeta<string>(PROXY_ENABLE_KEY, "false") === "true"
        });

        if(!enable) {
            project.setMeta(PROXY_ENABLE_KEY, "false");
        }
        else {
            const proxyName = await promptSelect({
                message: "Reverse proxy:",
                options: [
                    {label: "Local", value: TYPE_LOCAL},
                    {label: "Ngrok", value: TYPE_NGROK},
                    {label: "Serveo", value: TYPE_SERVEO},
                    {label: "LocalTunnel", value: TYPE_LT},
                ],
                default: project.getMeta(PROXY_TYPE_KEY)
            });

            switch(proxyName) {
                case TYPE_NGROK:
                    await this.ngrokService.init(project);
                    break;

                case TYPE_SERVEO:
                    await this.serveoService.init(project);
                    break;

                case TYPE_LT:
                    await this.localTunnelService.init(project);
                    break;
            }

            project.setMeta(PROXY_ENABLE_KEY, "true");
            project.setMeta(PROXY_TYPE_KEY, proxyName);
        }

        await project.save();
    }

    public async start(project: Project, restart?: boolean, rebuild?: boolean): Promise<void> {
        console.info("Staring proxy...");

        switch(project.getMeta(PROXY_TYPE_KEY)) {
            case TYPE_NGROK:
                await this.ngrokService.start(project, restart);
                break;

            case TYPE_SERVEO:
                await this.serveoService.start(project, restart, rebuild);
                break;

            case TYPE_LT:
                await this.localTunnelService.start(project, restart);
                break;
        }
    }

    public async stop(project: Project): Promise<void> {
        console.info("Stopping proxy...");

        switch(project.getMeta(PROXY_TYPE_KEY)) {
            case TYPE_NGROK:
                await this.ngrokService.stop(project);
                break;

            case TYPE_SERVEO:
                await this.serveoService.stop(project);
                break;

            case TYPE_LT:
                await this.localTunnelService.stop(project);
                break;
        }
    }

    public async build(project: Project, rebuild?: boolean): Promise<void> {
        switch(project.getMeta(PROXY_TYPE_KEY)) {
            case TYPE_NGROK:
                await this.ngrokService.build(rebuild);
                break;

            case TYPE_SERVEO:
                await this.serveoService.build(project, rebuild);
                break;

            case TYPE_LT:
                await this.localTunnelService.build(project, rebuild);
                break;
        }
    }

    public async logs(project: Project): Promise<void> {
        switch(project.getMeta(PROXY_TYPE_KEY)) {
            case TYPE_NGROK:
                await this.ngrokService.logs(project);
                break;

            case TYPE_SERVEO:
                await this.serveoService.logs(project);
                break;

            case TYPE_LT:
                await this.localTunnelService.logs(project);
                break;
        }
    }
}
