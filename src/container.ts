import { BlobServiceClient, ContainerClient, StorageSharedKeyCredential } from '@azure/storage-blob';

export function createContainerClient({account, accountKey, containerName} : {account: string, accountKey: string, containerName: string}): ContainerClient {
    return new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        new StorageSharedKeyCredential(account, accountKey)
    ).getContainerClient(containerName);
}