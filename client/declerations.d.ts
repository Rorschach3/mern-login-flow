declare module "*.svg" {
    const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | string;
    export default content;
}
