import KorisnikModel from '../../../../03-back-end/src/components/korisnik/model';
import BasePage from '../BasePage/BasePage';
import { Container, Form, Button, Card, Table, Spinner, Col, Row, Alert } from 'react-bootstrap';
import KorisnikService from '../../services/KorisnikService';
import { Link } from "react-router-dom"
import getLocationAndIp, { addAktivnost } from '../../Dnevnik/Dnevnik';
import DnevnikService from '../../services/DnevnikService';
import NaslovComponent from '../NaslovComponent/NaslovComponent';

class IzmenaPodatakaKorisnikComponentState {
    korisnik: KorisnikModel | null;
    ime: string;
    prezime: string;
    brTelefona: string;
    email: string;
    brLicneKarte: string;
    mestoPrebivalista: string;
    ulicaPrebivavlista: string;
    brojPrebivalista: string;
    datumRodjenja: string;
    isUspesno: boolean;
    isUProcesu: boolean;
    poruka: string;
    
}

export default class IzmenaPodatakaKorisnikComponent extends BasePage<{}> {
    state: IzmenaPodatakaKorisnikComponentState;

    constructor(props: any) {
        super(props);

        this.state = {
            korisnik: null,
            ime: "",
            prezime: "",
            brTelefona: "",
            email: "",
            brLicneKarte: "",
            mestoPrebivalista: "",
            ulicaPrebivavlista: "",
            brojPrebivalista: "",
            datumRodjenja: "",
            isUspesno: false,
            isUProcesu: false,
            poruka: "" 
            
        }
    }

    private getKorisnik() {
        KorisnikService.getKorisnikSluzbenik()
        .then(res => {
            this.setState({
                korisnik: res,
                ime: res?.ime,
                prezime: res?.prezime,
                jmbg: res?.jmbg,
                brTelefona: res?.br_telefon,
                email: res?.email,
                brLicneKarte: res?.br_licne_karte,
                datumRodjenja: res?.datum_rodjenja.substring(0, 10),
                mestoPrebivalista: res?.mesto_prebivalista,
                ulicaPrebivavlista: res?.ulica_prebivalista,
                brojPrebivalista: res?.broj_prebivalista
            })
        })
    }
    

    componentDidMount(): void {
        this.getKorisnik();
        addAktivnost(window.location.href, "Započeta izmena podataka za korisnika", "sluzbenik")
    }

    componentWillUnmount(): void {
       addAktivnost(window.location.href, "Završena izmena podataka za korisnika.", "sluzbenik")
    }

    renderMain(): JSX.Element {
        return (
            <Container>
                <NaslovComponent poruka="Izmena podataka korisnika" />
                { 
                    this.state.poruka !== "" ? (
                        <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                {
                     
                    !this.state.isUspesno ? (                   
                <><Form className="fromaDodavanjeNovogKorisnika">
                <Row className="mb-4">
                    <h4>Podaci o korisniku</h4>
                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                        <Form.Label>Ime</Form.Label>
                        <Form.Control value={this.state.ime} onChange={e => {this.uzmiPodatke(e)}}
                            required
                            type="text"
                            placeholder="Unesite ime"
                            name="ime"
                        />
                        <Form.Control.Feedback>U redu</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom02">
                    <Form.Label>Prezime</Form.Label>
                    <Form.Control value={this.state.prezime} onChange={e => {this.uzmiPodatke(e)}}
                        required
                        type="text"
                        placeholder="Unesite prezime"
                        name="prezime"
                    />
                    
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustomUsername">
                    <Form.Label>JMBG</Form.Label>
                    <Form.Control disabled value={this.state.korisnik?.jmbg} onChange={e => {this.uzmiPodatke(e)}}
                        type="text"
                        placeholder="Unesite JMBG korisnika"
                        required
                        name="jmbg"
                    />
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom02">
                    <Form.Label>Broj lične karte</Form.Label>
                    <Form.Control value={this.state?.brLicneKarte} onChange={e => {this.uzmiPodatke(e)}}
                        required
                        type="text"
                        placeholder="Unesite prezime"
                        name="brLicneKarte"
                    />
                </Form.Group>
            </Row>
            
            <Row className="mb-4">
                <h4>Adresa prebivališta</h4>
                <Form.Group as={Col} md="6" controlId="validationCustom03">
                    <Form.Label>Mesto</Form.Label>
                        <Form.Control value={this.state.mestoPrebivalista} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite mesto" name="mesto" required />
                        <Form.Control.Feedback type="invalid">
                            Obavezno polje.
                        </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom04">
                    <Form.Label>Ulica</Form.Label>
                    <Form.Control value={this.state.ulicaPrebivavlista} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite ulicu korisnika" name="ulica" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="1" controlId="validationCustom05">
                    <Form.Label>Broj</Form.Label>
                    <Form.Control value={this.state.brojPrebivalista} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Broj" name="broj" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className="mb-4">
                <h4>Mesto rođenja</h4>
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>Opština</Form.Label>
                    <Form.Control disabled value={this.state.korisnik?.opstina_rodjenja} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite opština rođenja korisnika" name="opstinaRodjenja" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>Mesto rođenja</Form.Label>
                    <Form.Control disabled value={this.state.korisnik?.mesto_rodjenja} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Mesto rođenja" name="mestoRodjenja" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>Država rođenja</Form.Label>
                    <Form.Control disabled value={this.state.korisnik?.drzava_rodjenja} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Država rođenja" name="drzavaRodjenja" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>Datum rođenja</Form.Label>
                    <Form.Control disabled value={this.state.datumRodjenja} onChange={e => {this.uzmiPodatke(e)}} type="date" placeholder="Unesite datum rođenja korisnika" name="datumRodjenja" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>               
            </Row>
            <Row className="mb-3">
                <h4>Kontakt podaci</h4>   
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>Broj telefona</Form.Label>
                    <Form.Control value={this.state.brTelefona} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite broj telefona korisnika" name="brTelefona" />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
                </Form.Group>    
                <Form.Group as={Col} md="3" controlId="validationCustom05">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control value={this.state.email} onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite E-mail" name="email" required />
                    <Form.Control.Feedback type="invalid">
                        Obavezno polje.
                    </Form.Control.Feedback>
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
                        "Izmeni podatke"
                    ) :
                        "Molimo sačekajte"
                    }
            </Button>
       </Form>     </>
                ):  
                    <Card>
                        <Card.Header as="h5">USPEŠNO STE IZMENILI PODATKE KORISNIKA</Card.Header>
                        <Card.Title>Novi podaci su: </Card.Title>
                        <Table striped bordered hover size="sm">

                                <tr>
                                    <th>Ime</th>
                                    <td>{this.state.korisnik?.ime}</td>
                                </tr>
                                <tr>
                                    <th>Prezime</th>
                                    <td>{this.state.korisnik?.prezime}</td>
                                </tr>
                                <tr>
                                    <th>JMBG</th>
                                    <td>{this.state.korisnik?.jmbg}</td>
                                </tr>
                                <tr>
                                    <th>Broj lične karte </th>
                                    <td>{this.state.korisnik?.br_licne_karte}</td>
                                </tr>
                                <tr>
                                    <th>Broj telefona</th>
                                    <td>{this.state.korisnik?.br_telefon}</td>
                                </tr>
                            </Table>
                            <Link to="/podaciKorisnik">
                                <Button variant='primary'>Zatvori</Button>
                            </Link>    
                        </Card>
                      
                    } 

                
                    
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
            isIzmena: true
        })            

        KorisnikService.editKorisnik({
            ime: this.state.ime,
            prezime: this.state.prezime,
            brTelefona: this.state.brTelefona,
            brLicneKarte: this.state.brLicneKarte,
            email: this.state.email,
            mesto: this.state.mestoPrebivalista,
            ulica: this.state.ulicaPrebivavlista,
            broj: this.state.brojPrebivalista
        })
        .then(res => {
            if(res.success) {
                this.setState({
                    korisnik: res.korisnik,
                    isUspesno: true,
                    isIzmena: false
                })
               addAktivnost(window.location.href, "Izmenjeni podaci za korisnika.", "sluzbenik");
            } else {
                this.setState({
                    isIzmena: false,
                    poruka: res.message
                })
            }
        })
    }

   
}