// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Call as $Call, Create as $Create} from "@wailsio/runtime";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as model$0 from "../model/models.js";

export function ConfigStore(url: string, username: string, token: string): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1691545528, url, username, token) as any;
    return $resultPromise;
}

export function PreferenceInfo(): Promise<model$0.Preference> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1342871400) as any;
    let $typingPromise = $resultPromise.then(($result: any) => {
        return $$createType0($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function Start(): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3716840919) as any;
    return $resultPromise;
}

// Private type creation functions
const $$createType0 = model$0.Preference.createFrom;
