import { Container, Form, Alert, Button, Spinner, InputGroup, Row, Modal } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Col from 'react-bootstrap/Col';
import { isUlogaUlogovana } from "../../../Api/api";
import EventRegister from "../../../Api/EventRegister";
import getLocationAndIp from "../../../Dnevnik/Dnevnik";
import KorisnikService from "../../../services/KorisnikService";
import BasePage from "../../BasePage/BasePage";
import DnevnikService from '../../../services/DnevnikService';
import { addAktivnost } from '../../../Dnevnik/Dnevnik';
import NaslovComponent from "../../NaslovComponent/NaslovComponent";
import "./dodavanjeKorisnikaPage.css"

class DodajKorisnikaPageState {
    ime: string;
    prezime: string;
    brLk: string;
    brTelefona: string;
    jmbg: string;
    ulica: string;
    broj: string;
    mesto: string;
    opstinaRodjenja: string;
    mestoRodjenja: string;
    drzavaRodjenja: string
    datumRodjenja: string;
    email: string
    poruka: string;
    isUlogovan: boolean | null
    isKreiran: boolean;
    isUProcesu: boolean;
    isNeaktivan: boolean;

}

export default class DodajKorisnikaPage extends BasePage<{}> {
    state: DodajKorisnikaPageState;

    constructor(props: any) {
        super(props);

        this.state = {
            ime: "",
            prezime: "",
            brLk: "",
            jmbg: "",
            brTelefona: "",
            ulica: "",
            broj: "",
            mesto: "",
            opstinaRodjenja: "",
            mestoRodjenja: "",
            drzavaRodjenja: "",
            datumRodjenja: "",
            email: "",
            poruka: "",
            isUlogovan: null,
            isKreiran: false,
            isUProcesu: false,
            isNeaktivan: false

        }
    }
    

    componentDidMount(): void {
        isUlogaUlogovana("sluzbenik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login");
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
            }

            addAktivnost(window.location.href, "Službenik započeo dodavanje korisnika.", "sluzbenik");
        })           
    }

    componentWillUnmount(): void {
       addAktivnost(window.location.href, "Službenik završio dodavanje korisnika.", "sluzbenik");
    }
    
    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }

        if(this.state.isKreiran) {
            return <Redirect to={"/dodajRacun"} />    
        }
        return (
            <Container>
                <NaslovComponent poruka="Dodavanje novog korisnika" />
                {
                    this.state.poruka !== "" ? (
                        <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                <Form className="fromaDodavanjeNovogKorisnika">
                    <Row className="mb-4">
                        <h4>Podaci o korisniku</h4>
                        <Form.Group as={Col} md="3">
                            <Form.Label>Ime</Form.Label>
                            <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite ime" name="ime"/>
                            
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Prezime</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite prezime" name="prezime"/>
                        
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>JMBG</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite JMBG korisnika" name="jmbg"/>
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Broj lične karte</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite broj lične karte korisnika" name="brLk"/>
                    </Form.Group>
                </Row>
                
                <Row className="mb-4">
                    <h4>Adresa prebivališta</h4>
                    <Form.Group as={Col} md="6">
                        <Form.Label>Mesto</Form.Label>
                            <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite mesto" name="mesto"/>
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Ulica</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite ulicu korisnika" name="ulica"/>
                    </Form.Group>
                    <Form.Group as={Col} md="1">
                        <Form.Label>Broj</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Broj" name="broj"/>
                    </Form.Group>
                </Row>
                <Row className="mb-4">
                    <h4>Mesto rođenja</h4>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Opština</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite opština rođenja korisnika" name="opstinaRodjenja"/>
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Mesto rođenja</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Mesto rođenja" name="mestoRodjenja"/>
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Država rođenja</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Država rođenja" name="drzavaRodjenja"/>
                    </Form.Group>
                    <Form.Group as={Col} md="3">
                        <Form.Label>Datum rođenja</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="date" placeholder="Unesite datum rođenja korisnika" name="datumRodjenja"/>
                    </Form.Group>               
                </Row>
                <Row className="mb-3">
                    <h4>Kontakt podaci</h4>   
                    <Form.Group as={Col} md="3">
                        <Form.Label>Broj telefona</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite broj telefona korisnika" name="brTelefona" />
                    </Form.Group>    
                    <Form.Group as={Col} md="3">
                        <Form.Label>E-mail</Form.Label>
                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite E-mail" name="email"/>
                    </Form.Group>    
                </Row>           
        
                <Button disabled = {this.state.isUProcesu} onClick={() => {this.posaljiPodatke()}} variant="primary">
                    <Spinner 
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        hidden = {!this.state.isUProcesu}
                    />
                    {
                        !this.state.isUProcesu ? (
                            "Kreiraj korisnika"
                        ) :
                            "Molimo sačekajte"
                        }
                </Button>
           </Form>

            <Modal show = {this.state.isNeaktivan}>
                   <Modal.Header>
                        <Modal.Title>Kreiranje korisnika</Modal.Title>
                   </Modal.Header>

                   <Modal.Body>
                       Korisnik sa unetim podacima postoji u sistemu ali nije aktivan zato što za korisnika nisu otvoreni računi. Ukoliko želite da izvršite dodavanje računa 
                       za korisnika, biće izvšeno ažuriranje podataka za korisnika i bećete preusmereni na stranicu za otvaranje računa.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='primary' value="true" onClick={e => {this.azurirajPodatke(e)}}>
                            Ažuriraj podatke i otvori račun
                        </Button>
                        <Button variant='danger' value="false" onClick={e => {this.azurirajPodatke(e)}}>Odustani</Button>
                    </Modal.Footer>

            </Modal>            
     
            </Container>
        )    
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    private posaljiPodatke() {
       
        this.setState({
            isUProcesu: true
        })
        
        if(this.state.ime !== "" && this.state.prezime !== "" && this.state.brLk !== "" && this.state.jmbg !== "" && this.state.brTelefona !== "" && this.state.ulica !== "" &&
          this.state.broj !== "" && this.state.mesto !== "" && this.state.mestoRodjenja !== "" && this.state.datumRodjenja !== "" && this.state.opstinaRodjenja !== "" &&
          this.state.datumRodjenja !== "" && this.state.email !== "") {
            if(this.state.jmbg.length === 13) {
                KorisnikService.addKorisnik(
                    {
                        ime: this.state.ime,
                        prezime: this.state.prezime,
                        brLicneKarte: this.state.brLk,
                        jmbg: this.state.jmbg,
                        brTelefona: this.state.brTelefona,
                        ulica: this.state.ulica,
                        broj: this.state.broj,
                        mesto: this.state.mesto,
                        mestoRodjenja: this.state.mestoRodjenja,
                        drzavaRodjenja: this.state.drzavaRodjenja,
                        opstinaRodjenja: this.state.opstinaRodjenja,
                        datumRodjenja: this.state.datumRodjenja,
                        email: this.state.email
                    }
                )
                .then(res => {
                    if(!res.success) {
                        if(res.message) {
                            return this.setState({
                                isNeaktivan: true
                            })
                        }

                        this.setState({
                            poruka: res.message,
                            isUProcesu: false
                        })
                    } else {
                        this.setState({
                            isKreiran: true,
                            isUProcesu: false
                        })
                        addAktivnost(window.location.href, "Službenik dodao novog korisnika.", "sluzbenik");
                    }
                })
            } else {
                this.setState({
                    isUProcesu: false,
                    poruka: "JMBG mora imati 13 brojeva."
                })
            }
        } else {
            this.setState({
                isUProcesu: false,
                poruka: "Morate popuniti sva polja."
            })
        }
    }

    private azurirajPodatke(e: any) {
        if(e.target.value === "true") {
            this.setState({
                isUProcesu: true    
            })
            if(this.state.ime !== "" && this.state.prezime !== "" && this.state.brLk !== "" && this.state.brTelefona !== "" && this.state.email !== "" && this.state.mesto !== "" &&
              this.state.ulica !== "" && this.state.broj !== "") {
                KorisnikService.editKorisnikNeaktivan({
                    ime: this.state.ime,
                    prezime: this.state.prezime,
                    brLicneKarte: this.state.brLk,
                    brTelefona: this.state.brTelefona,
                    email: this.state.email,
                    mesto: this.state.mesto,
                    ulica: this.state.ulica,
                    broj: this.state.broj
                })
                .then(res => {
                    if(res.success) {
                        this.setState({
                            isKreiran: true,
                            isUProcesu: false
                        })
                    } else {
                        this.setState({
                            isUProcesu: false
                        })
                    }   
                })
            } else {
                this.setState({
                    isUProcesu: false,
                    poruka: "Morate popuniti sva polja."
                })
            }
        } else {
             this.setState({
                isNeaktivan: false,
                isUProcesu: false
            })
        } 
    
    }
}