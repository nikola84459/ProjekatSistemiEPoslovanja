import BasePage, { BasePageProperties } from "../BasePage/BasePage";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import KorisnikService from "../../services/KorisnikService";
import Feedback from 'react-bootstrap/Feedback'
import "./izmenaSifre.css";
import getLocationAndIp, { addAktivnost } from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import NaslovComponent from "../NaslovComponent/NaslovComponent";
import EventRegister from '../../Api/EventRegister';
import { Redirect } from "react-router-dom";

class IzmenaSifreProperties extends BasePageProperties {
    naslov: string;
    isPrvaPrijava: boolean
}

class IzmenaSifreState {
    isIspravnaSifra: boolean;
    isPoklapaju: boolean;
    staraSifra: string;
    novaSifra: string;
    ponovoNovaSifra: string;
    poruka: string;
    uspesno: string;
    naslov: string;
    isPrvaPrijava: boolean;
    isPreusmeri: boolean;
    isIzmena: boolean;
}

export default class IzmenaSifre extends BasePage<IzmenaSifreProperties> {
    state: IzmenaSifreState;
    
    constructor(props: any) {
        super(props)

        this.state = {
            isIspravnaSifra: true,
            isPoklapaju: true,
            staraSifra: "",
            novaSifra: "",
            ponovoNovaSifra: "",
            poruka: "",
            uspesno: "",
            naslov: this.props.naslov,
            isPrvaPrijava: this.props.isPrvaPrijava,
            isPreusmeri: false,
            isIzmena: false
        }
    }

    
    componentDidMount(): void {
        addAktivnost(window.location.href, "Započeta izmena šifre korisnika.", "korisnik");    
        
    }

    componentWillUnmount(): void {
        addAktivnost(window.location.href, "Završena izmena šifre korisnika.", "korisnik");
        
    }

    renderMain(): JSX.Element {
        if(this.state.isPreusmeri) {
            return (
                <Redirect to="/korisnik/pregledRacuni" />
            )
        }

        return (
            <Container className="forma">
                <NaslovComponent poruka = {this.state.naslov} />
               {
                    this.state.poruka !== ""  ? (
                <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                {
                    this.state.uspesno !== "" ? (
                <Alert className="alert" key={"success"} variant={"success"}>
                    <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isPrvaPrijava}
                        />
                        
                       
                    {this.state.uspesno}</Alert>
                ): ""}
                <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Stara šifra</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="staraSifra" placeholder="Unesite staru šifru" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Nova šifra</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="novaSifra" placeholder="Unesite novu šifru" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Ponovo unesite novu šifru</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="ponovoNovaSifra" placeholder="Ponovo unesite novu šifru" />
                </Form.Group>
                </Form>
                <Button disabled = {this.state.isIzmena} onClick={() => {this.posaljiPodatke()}}  variant="primary">
                <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isIzmena}
                        />
                        {
                        !this.state.isIzmena ? (
                            "Promenite šifru"
                        ) :
                            "Molimo sačekajte"
                        }
                </Button>
          </Container>  
        )    
    }

    private uzmiPodatke(e: any) {
        if(this.state.poruka !== "") {
            this.setState({
                poruka: "",
                uspesno: ""
            })
        }
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    private async posaljiPodatke() {
        this.setState({
            isIzmena: true
        })
        
        if(this.state.staraSifra === "" || this.state.novaSifra === "" || this.state.ponovoNovaSifra === "") {
            return this.setState({
                isIzmena: false,
                poruka: "Morate popuniti sva polja."        
            })
        } else {
            if(this.state.staraSifra.length < 8 || this.state.novaSifra.length < 8 || this.state.ponovoNovaSifra.length < 8) {
                return this.setState({
                    isIzmena: false,
                    poruka: "Šifra mora imati minimum 8 karaktera."
                })
            }
        }
        
        if(this.state.novaSifra === this.state.ponovoNovaSifra) { 
            KorisnikService.changePassword({
                password_hash_old: this.state.staraSifra,
                password_hash: this.state.novaSifra,
                password_hash_ponovo: this.state.ponovoNovaSifra,
                isPrvaPrijava: this.state.isPrvaPrijava
            })
            .then(async res => {
                if(!res.success) {
                    this.setState(
                        {
                        poruka: res.message,
                        isIzmena: false
                        }
                    ) 
                } else {
                    if(!this.state.isPrvaPrijava) {
                        this.setState({
                            uspesno: "Uspešno ste promenili šifru.",
                            isIzmena: false
                        })

                        addAktivnost(window.location.href, "Promenjena šifra korisnika", "korisnik");    
                    } else {
                        this.setState({
                            uspesno: "Uspešno ste promenili šifru, bićete preusmereni na početnu stranicu za 10 sekundi.",
                            isIzmena: false
                        })
                       
                        await new Promise(reslove => setTimeout(reslove, 10000));

                        this.setState({
                            isPreusmeri: true
                        })

                        EventRegister.emit("AUTH_EVENT", "korisnik_logIn_uspesno")

                        addAktivnost(window.location.href, "Promenjena šifra korisnika - prva prijava", "korisnik");
                    }
                        
                    
                }       
            })
        } else {
            this.setState({
                poruka: "Šifre se ne poklapaju.",
                isIzmena: false
            })
        }
    }
 
}