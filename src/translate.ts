import { MatrixClientPeg } from "./MatrixClientPeg";
import SdkConfig from "./SdkConfig";

export default async function translate(
    content: string,
    language: string
): Promise<string> {
    if (!content || !language) {
        return content;
    }

    const token = MatrixClientPeg.getCredentials()?.accessToken;
    if (!token) {
        return content;
    }

    const response = await fetch(SdkConfig.get().epic_translation_api, {
        method: "post",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            content,
            source_language_code: "auto",
            target_language_code: language,
        }),
    });

    const json = await response.json();
    return json.translation;
}
