import BasePage, { BasePageProperties } from "../BasePage/BasePage";
import IzmenaSifre from "./IzmenaSifre";

class PrvaPrijavaState {
    naslov: string;
    isPrvaPrijava: boolean
}

export default class PrvaPrijavaIzmenaSifre extends BasePage<{}> {
    state: PrvaPrijavaState;

    constructor(props: any) {
        super(props);

        this.state = {
            naslov: "Molimo Vas da izmenite šifru kod prve prijave",
            isPrvaPrijava: true
        }
    }

    renderMain(): JSX.Element {
        return (
            <IzmenaSifre naslov={this.state.naslov} isPrvaPrijava={this.state.isPrvaPrijava} />
        )
    }
}