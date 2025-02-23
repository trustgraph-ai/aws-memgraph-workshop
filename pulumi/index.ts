
/****************************************************************************

Entry point.
                       
****************************************************************************/

import * as fs from 'fs';

//import { caCert, caKey } from './certs';

// Export CA credentials, will be needed to create other VPN credentials
//export const caPublic = caCert.certPem;
//export const caPriv = caKey.privateKeyPem;

import { sshKey } from './instance';
import { address as addr } from './address';

sshKey.privateKeyOpenssh.apply(
    (key) => {
        fs.writeFile(
            "ssh-private.key",
            key,
            err => {
                if (err) {
                    console.log(err);
                    throw(err);
                } else {
                    console.log("Wrote private key.");
                }
            }
        );
    }
);

export const address = addr.publicIp;

