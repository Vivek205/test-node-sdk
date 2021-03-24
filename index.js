import { promises as fs } from 'fs';

const main = async () => {
    const content = await fs.readFile("./media/style-transfer/content.png", {encoding:"base64"})
    const style = await fs.readFile("./media/style-transfer/style.png", {encoding:"base64"})
    console.log("content", content);
    console.log("style",style);

}

main()