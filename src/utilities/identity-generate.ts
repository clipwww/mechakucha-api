import * as uuid from "uuid";
import * as shortid from "shortid";

class IdentityGenerate {
    generateV4UUID(): string {
        return uuid.v4();
    }

    generateShortId(): string {
        return shortid.generate();
    }
}

export const idGenerator = new IdentityGenerate();