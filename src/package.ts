import { ContainerClient } from "@azure/storage-blob";
import { Parse } from "tar";

type Manifest = {
    'dist-tags': {[tag: string]: string}
}

export async function resolveVersion(containerClient: ContainerClient, name: string, tag: string): Promise<string | undefined> {
    const manifestClient = containerClient.getBlockBlobClient(`${name}/package.json`);
    const buff = await manifestClient.downloadToBuffer();

    const parsed = JSON.parse(buff.toString()) as Manifest;
    
    return parsed['dist-tags'][tag];
}

export async function getPackageStream(containerClient: ContainerClient, name: string, version: string): Promise<Parse> {
    const noScopeName = name.split('/').pop()!;
    const tarPath = `${name}/${noScopeName}-${version}.tgz`;

    const tarClient = containerClient.getBlockBlobClient(tarPath);

    const readStream = (await tarClient.download(undefined, undefined)).readableStreamBody!;

    return readStream.pipe(new Parse());
}