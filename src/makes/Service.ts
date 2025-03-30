export type ServiceProps = {
    name: string;
    imageName?: string;
    imageVersion?: string;
    volume?: string;
};

export class Service {
    public name: string;
    public imageName?: string;
    public imageVersion?: string;
    protected _volume?: string;

    public constructor(props: ServiceProps) {
        const {
            name,
            imageName,
            imageVersion,
            volume
        } = props;

        this.name = name;
        this.imageName = imageName;
        this.imageVersion = imageVersion;
        this._volume = volume;
    }

    public get imageTag(): string {
        let imageName = this.imageName,
            imageVersion = this.imageVersion;

        if(!imageName) {
            imageName = "ollama/ollama";
        }

        if(!imageVersion) {
            return imageName;
        }

        return `${imageName}:${imageVersion}`;
    }

    public get containerName(): string {
        return `ollama-${this.name}.ws`;
    }

    public get volume(): string {
        if(!this._volume) {
            this._volume = this.defaultVolume;
        }

        return this._volume;
    }

    public set volume(volume: string) {
        this._volume = volume;
    }

    public get defaultVolume(): string {
        return `wocker-ollama-${this.name}`;
    }

    public toObject(): ServiceProps {
        return {
            name: this.name,
            imageName: this.imageName,
            imageVersion: this.imageVersion,
            volume: this._volume
        };
    }
}
