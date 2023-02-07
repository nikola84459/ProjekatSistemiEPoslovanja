import * as mysql2 from "mysql2/promise"

export default interface IApplicationResources {
    databaseconection: mysql2.Connection;
}