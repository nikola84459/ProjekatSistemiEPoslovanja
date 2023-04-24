import BasePage from "../BasePage/BasePage";
import { Form, Container, Button, Alert, Spinner } from "react-bootstrap";
import "./korisnikLogInComponent.css"
import EventRegister from '../../Api/EventRegister';
import { Redirect } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { isUlogaUlogovana } from "../../Api/api";
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import NaslovComponent from "../NaslovComponent/NaslovComponent";

class KorisnikLogInComponentState {
    kime: string;
    lozinka: string;
    poruka: string;
    isPrijavljen: boolean;
    isPrvaPrijava: boolean;
    isDisabled: boolean;
    isLogovanje: boolean;
}

export default class KorisnikLogInComponent extends BasePage<{}> {
    state: KorisnikLogInComponentState;

    constructor(props: any) {
        super(props);

        this.state = {
            kime: "",
            lozinka: "",
            poruka: "",
            isPrijavljen: false,
            isPrvaPrijava: false,
            isDisabled: false,
            isLogovanje: false
        }
    }

    componentDidMount() {
        isUlogaUlogovana("korisnik")
        .then(res => {
            if(res) {
                EventRegister.emit("AUTH_EVENT", "korisnik_logIn_uspesno");
            }
        })
        EventRegister.on("AUTH_EVENT", this.handleAuthEvent.bind(this));
    }

    componentWillUnmount() {
        EventRegister.off("AUTH_EVENT", this.handleAuthEvent.bind(this));    
    }

    
    renderMain(): JSX.Element {
        if(this.state.isPrijavljen) {
            return (
                <Redirect to={"/korisnik/pregledRacuni"} />
            )
        }

        if(this.state.isPrvaPrijava) {
            return (
                <Redirect to={"/prvaPrijava"} />    
            )
        }

        return (
            <Container className="prijava">
                <NaslovComponent poruka="Prijava na sistem - korisnik"/>
                {
                    this.state.poruka !== "" ? (
                <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Korisničko ime</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" name="kime" placeholder="Unesite Vaše korisničko ime" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Lozinka</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="lozinka" placeholder="Unesite Vašu lozinku" />
                </Form.Group>
                </Form>
                <Button disabled = {this.state.isDisabled} onClick={() => {this.posaljiPodatke()}} variant="primary">
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    hidden = {!this.state.isLogovanje}
                    />
                    {
                        !this.state.isLogovanje ? (
                            "Prijavi se"
                        ) :
                            "Molimo sačekajte"
                    }
                    </Button>
            </Container>
        )
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })
    } 

    private posaljiPodatke() {
        AuthService.korisnikLogIn({
            username: this.state.kime,
            password: this.state.lozinka
        })

        this.setState({
            isLogovanje: true,
            isDisabled: true
        })
        
    }

    private handleAuthEvent(status: string, data: any) {
        if(status === "korisnik_login_neuspelo") {
            this.setState({
                poruka: data[0].data,
                isLogovanje: false,
                isDisabled: false
            })
        } else if (status === "korisnik_logIn_uspesno") {
            this.setState({
                isPrijavljen: true,
                kime: "",
                lozinka: ""    
            })

            addAktivnost(window.location.href, "Ulogovan korisnik", "korisnik");
        } else if (status === "korisnik_login_prva_prijava") {
            this.setState({
                isPrvaPrijava: true
            })
        }
        
    }
    
}