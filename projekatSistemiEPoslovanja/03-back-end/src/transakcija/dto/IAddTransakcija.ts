import Ajv from "ajv";

interface IAddTransakcija {
    iznos: number;
    valuta_id: number;
    racun_id: number;
    svrha: string;
    isKupovina: boolean;
}

const ajv = new Ajv();

const IAddTransakcijaValidator = ajv.compile({
    type: "object",
    properties: {
        iznos: {
            type: "integer",
            minLength: 1
        },

        valuta_id: {
            type: "integer",
            minLength: 1
        },

        racun_id: {
            type: "integer",
            minLength: 1
        },

        svrha: {
            type: "string",
            minLength: 1,
            maxLength: 255
        },

        isKupovina: {
            type: "boolean",
        }
    },

    required: [
        "iznos",
        "racun_id"
    ],

    additionalProperties: false,
});

export {IAddTransakcija};
export {IAddTransakcijaValidator};