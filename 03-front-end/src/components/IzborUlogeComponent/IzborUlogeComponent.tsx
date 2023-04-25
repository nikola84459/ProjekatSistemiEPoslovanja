import BasePage from "../BasePage/BasePage";
import { Card, Container } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import "./izborUlogeComponent.css"

export default class IzborUlogeComponent extends BasePage<{}> {
    renderMain(): JSX.Element {
        if(localStorage.getItem("korisnik-auth-token") !== "" && localStorage.getItem("korisnik-auth-token") !== undefined && localStorage.getItem("korisnik-refresh-token") !== "" && localStorage.getItem("korisnik-refresh-token") !== undefined) {
            return <Redirect to="/korisnik/pregledRacuni" />
        }

        if(localStorage.getItem("sluzbenik-auth-token") !== "" && localStorage.getItem("sluzbenik-auth-token") !== undefined && localStorage.getItem("sluzbenik-refresh-token") !== "" && localStorage.getItem("sluzbenik-refresh-token") !== undefined) {
            return <Redirect to="/sluzbenikPocetna" />
        }

        return (
            <Container>
                <Card>
                    <Card.Header as="h5">IZABERITE VAŠU ULOGU</Card.Header>
                    <Card.Body>
                    <Link className="linkovi" to={"/security/prijavaKorisnik"}>Prijava korisnik</Link>
                    
                    <Link className="linkovi" to={"/security/prijavaSluzbenik"}>Prijava sluzbenik</Link>
                    </Card.Body>
                </Card>
        </Container>
        )    
    }
}