import {ConfigCollection} from "@wocker/core";

import {Service, ServiceProps} from "./Service";


type ConfigProps = {
    default?: string;
    services?: ServiceProps[];
};

export abstract class Config {
    public default?: string;
    public services: ConfigCollection<Service, ServiceProps>;

    public constructor(props: ConfigProps) {
        const {
            default: defaultService,
            services = []
        } = props;

        this.default = defaultService;
        this.services = new ConfigCollection(Service, services);
    }

    public hasService(name: string): boolean {
        const service = this.services.getConfig(name);

        return !!service;
    }

    public getService(name: string): Service {
        const service = this.services.getConfig(name);

        if(!service) {
            throw new Error(`Ollama "${name}" service not found`);
        }

        return service;
    }

    public getDefaultService(): Service {
        if(!this.default) {
            throw new Error("No services are installed by default");
        }

        return this.getService(this.default);
    }

    public getServiceOrDefault(name?: string): Service {
        if(!name) {
            return this.getDefaultService();
        }

        return this.getService(name);
    }

    public setService(service: Service): void {
        this.services.setConfig(service);

        if(!this.default) {
            this.default = service.name;
        }
    }

    public unsetService(name: string): void {
        const service = this.getService(name);

        this.services.removeConfig(service.name);

        if(this.default === service.name) {
            delete this.default;
        }
    }

    public toObject(): ConfigProps {
        return {
            default: this.default,
            services: this.services.toArray()
        };
    }

    public abstract save(): void;
}
