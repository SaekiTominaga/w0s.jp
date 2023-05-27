interface StructuredDataTemplate {
    readonly name: string;
    readonly toc?: boolean;
}
interface StructuredDataUrl {
    readonly path: string;
    readonly name: string;
}
interface StructuredData {
    readonly template: StructuredDataTemplate;
    readonly type?: 'website' | 'article' | 'profile';
    readonly 'schema-type'?: 'WebPage' | 'AboutPage' | 'CheckoutPage' | 'CollectionPage' | 'ContactPage' | 'FAQPage' | 'ItemPage' | 'MedicalWebPage' | 'ProfilePage' | 'QAPage' | 'RealEstateListing' | 'SearchResultsPage';
    readonly title: string;
    readonly heading?: string;
    readonly subHeading?: string;
    dateModified?: import('dayjs').Dayjs;
    readonly description?: string;
    readonly image?: string;
    readonly breadcrumb?: StructuredDataUrl[];
    readonly localNav?: StructuredDataUrl[];
    readonly moduleScripts: string[];
    readonly opensearch: StructuredDataUrl;
}
/**
 * HTML 構造データ
 */
export default class HtmlStructuredData {
    /**
     * JSON ファイルからページの構造データを取得
     *
     * @param {string} htmlFilePath - HTML（EJS）ファイルパス
     *
     * @returns {object} 構造データ
     */
    static getForJson(htmlFilePath: string): Promise<StructuredData>;
    /**
     * 構造データを取得する
     *
     * @param {string} fileData - ファイルから取得したデータ
     *
     * @returns {object} 構造データ
     */
    static getStructuredData(fileData: string): StructuredData;
    /**
     * JSON-LD 用のデータを構築
     *
     * @param {object} structuredData - ページで指定された構造データ
     *
     * @returns {object} JSON-LD データ
     */
    static getJsonLd(structuredData: StructuredData): object | undefined;
}
export {};
