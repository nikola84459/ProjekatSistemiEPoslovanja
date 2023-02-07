import Ajv from "ajv";

interface IObrisi {
    
    isBrisi: boolean;
    racunId: number;
    
}

const ajv = new Ajv();

const IObrisiValidator = ajv.compile({
    type: "object",
    properties: {
        isBrisi: {
            type: "boolean",

        },

        racunId: {
            type: "integer",
        }
    },

    required: [
        "isBrisi",
    ],

    additionalProperties: false,
});

export {IObrisi};
export {IObrisiValidator};