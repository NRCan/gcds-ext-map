declare const _default: {
    title: string;
    argTypes: {
        lat: {
            name: string;
            control: {
                type: string;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        lon: {
            name: string;
            control: {
                type: string;
                min: number;
                max: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        zoom: {
            name: string;
            control: {
                type: string;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        projection: {
            name: string;
            control: {
                type: string;
            };
            options: string[];
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        layer: {
            name: string;
            control: string;
            options: string[];
            mapping: {};
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        lang: {
            name: string;
            control: {
                type: string;
            };
            options: string[];
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        controls: {
            name: string;
            control: string;
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        static: {
            name: string;
            control: string;
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        controlslist: {
            name: string;
            control: string;
            options: string[];
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        caption: {
            name: string;
            control: {
                type: string;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
    };
};
export default _default;
export declare const Default: any;
export declare const HiddenBasemap: {
    (args: any): string;
    args: {
        lat: number;
        lon: number;
        zoom: number;
        projection: string;
        controls: boolean;
        layer: string;
        caption: string;
    };
};
export declare const Playground: {
    (args: any): string;
    args: {
        lat: number;
        lon: number;
        zoom: number;
        projection: string;
        controls: boolean;
        static: boolean;
        lang: string;
        controlslist: string[];
        layer: string;
        caption: string;
    };
};
export declare const GeoJSON2MapMLExample: {
    render: (args: any, { loaded }: {
        loaded: any;
    }) => Element;
    args: {
        lat: number;
        lon: number;
        zoom: number;
        projection: string;
        controls: boolean;
        static: boolean;
        lang: string;
        controlslist: string[];
        layer: string;
        caption: string;
    };
    loaders: (() => Promise<{
        geoJsonData: any;
        error?: undefined;
    } | {
        geoJsonData: any;
        error: any;
    }>)[];
    parameters: {
        docs: {
            source: {
                type: string;
                language: string;
                code: string;
            };
        };
    };
};
export declare const DarkMode: {
    render: (args: any) => string;
    args: {
        lat: number;
        lon: number;
        zoom: number;
        projection: string;
        controls: boolean;
        static: boolean;
        lang: string;
        controlslist: string[];
        caption: string;
    };
};
