import { useState } from "react";
import { Platform, Text, View} from "react-native";

import {BarcodeScanner } from "./components/barcodescanner"

async function OFFgetProduct(ean: string) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
                //UserAgent: "TestApp/1.228 (ponomarev.educ@gmail.com)"
            }
        });
        const product = await response.json();
        if (product.status === 0) {
            return null;
        }
        return product;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const OFFMaterials = new Map<string, string>()
OFFMaterials.set("en:hdpe-2-high-density-polyethylene", "HDPE-2 Polyethylene")
OFFMaterials.set("en:pet-1-polyethylene-terephthalate", "PET-1 Terephthalate")
OFFMaterials.set("en:pp-5-polypropylene", "PP-5 Polypropylene")

export default function Main() {
    const [productName, setProductName] = useState("")
    const [info, setInfo] = useState('No info')
    const [infoColor, setColor] = useState("rgba(0,0,0,0.2)")
    const [displayMode, setDisplayMode] = useState("none")
    const infoStyle = {fontSize: Platform.select({web: "1.5rem", default: 24}),
                        display: displayMode,
                        backgroundColor: infoColor,
                        padding: 20,
                        margin: 10,
                        borderRadius: 10}

    const processBarcode = async (code: string) => {
        const product = await OFFgetProduct(code)
        if (!product)
            return
        const packagings = product["product"]["ecoscore_data"]["adjustments"]
                                      ["packaging"]["packagings"]
        let materials: string[] = []
        let nonRecyclableCount: number = 0
        let totalItemsCount: number = 0

        for (const pack in packagings) {
            ++totalItemsCount
            const materialWeirdName = packagings[pack]["material"]
            const materialNormalName = OFFMaterials.get(materialWeirdName)
            let materialInfo = ""
            if (materialNormalName)
                materialInfo += materialNormalName
            else
                materialInfo += "Some unknown material: " + materialWeirdName
            if (packagings[pack]["non_recyclable_and_non_biodegradable"] === "no") {
                materialInfo += " is recyclable."
            }
            else {
                materialInfo += " is NOT recyclable"
                ++nonRecyclableCount
            }
            materials.push(materialInfo)
        }

        if (totalItemsCount < 1) {
            setInfo("No information available for this item :(")
            setProductName("")
            setDisplayMode("flex")
            setColor("rgba(255, 0, 0, 0.3)")
            return
        }

        let infoString: string = "Variants of packaging:"
        for (const material of materials) {
            infoString += '\n' + material
        }
        if (nonRecyclableCount > 0 && nonRecyclableCount != totalItemsCount) {
            infoString += "\n\nOnly some of the possible variants of the packaging for this product are " +
                "recyclable.\nPlease check which one you've got and act accordingly!"
            setColor("rgba(255, 255, 0, 0.3)")
        }
        else if (nonRecyclableCount > 0 && nonRecyclableCount == totalItemsCount) {
            infoString += "\n\nNone of the variants of packaging for this product are recyclable." +
                "\nDO NOT RECYCLE!"
            setColor("rgba(255, 0, 0, 0.3)")
        }
        else {
            infoString += "\n\nAll variants of packaging for this product are recyclable!" +
                "\nRecycle it. NOW."
            setColor("rgba(0, 255, 0, 0.3)")
        }
        setDisplayMode("flex")
        setInfo(infoString)
        setProductName(product["product"]["product_name"])
    }

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.88)" }}>
            <Text style={{ fontSize: Platform.select({web: "1.5rem", default: 24}),
                color: "white" }}>
            Scan the bar code</Text>
            <BarcodeScanner callbackBarcodeDetected={processBarcode} />
            <View style={infoStyle}>
                {productName !== "" &&
                <Text style={{ alignSelf: "center", fontSize: Platform.select({web: "1.8rem", default: 30}), color: "white" }}>{productName}</Text>
                }
                <Text style={{ fontSize: Platform.select({web: "1.8rem", default: 30}), color: "white" }}>{info}</Text>
            </View>
        </View>
    );
}
