import { createContainerClient } from './container';
import { getPackageStream, resolveVersion } from './package';
import { valid } from 'semver'
import cors from 'cors';
import log from 'loglevel';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
log.setLevel(0)

const PORT = parseInt(process.env.PORT!);

const containerClient = createContainerClient({
    account: process.env.ACCOUNT!, 
    accountKey: process.env.ACCOUNT_KEY!,
    containerName: process.env.CONTAINER_NAME!
});


const app = express();
app.use(cors());
app.use('/npm/(:scope/)?:noScopeName/:tag/*', async (req, res) => {
    const { scope, noScopeName, tag } = req.params; 
    const filePath = req.params[0] as string;

    const name = scope ? `@${scope}/${noScopeName}` : noScopeName;

    log.info(`\n${filePath} from ${name}@${tag} requested`);

    let version: string;
    try {
        if (valid(tag)) {
            version = tag;
        } else {
            const v = await resolveVersion(containerClient, name, tag);
            if (!v) throw Error()

            version = v;
            log.info(`${name}@${tag} resolved to ${name}@${version}`);
        }



    } catch (e){
        res.statusCode = 404;
        res.send(`${name}@${tag} not found`);
        res.end();

        log.log(`${name}@${tag} not found`);
        return;
    }

    try {
        (await getPackageStream(containerClient, name, version))
        .on('entry', (entry) => {
            if (entry.path !== `package/${filePath}`) {
                entry.resume();
                return;
            }
            
            entry.pipe(res);
        })
        .on('end', async () => {
            res.end();
            log.info(`${filePath} from ${name}@${version} served`)
        });
    } catch {
        res.statusCode = 500;
        res.send(`Could not read ${name}@${version}`);
        res.end();

        log.error(`Could not read ${name}@${version}`);
        return;
    }
});


app.listen(PORT, '0.0.0.0', () => {
    log.log(`Port: ${PORT}`);
});