import { v4 as uuidv4 } from "uuid";
import shortid from "shortid";
class IdentityGenerate {
    generateV4UUID() {
        return uuidv4();
    }
    generateShortId() {
        return shortid.generate();
    }
}
export const idGenerator = new IdentityGenerate();
