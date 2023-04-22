import Ajv from "ajv";

interface IEditIsAktivan {
    racunId: number;
    
}

const ajv = new Ajv();

const IEditIsAktivanValidator = ajv.compile({
    type: "object",
    properties: {
        racunId: {
            type: "integer",
        }
    },

    required: [
        "racunId",
    ],

    additionalProperties: false,
});

export {IEditIsAktivan};
export {IEditIsAktivanValidator};