declare function xit(name: string, implementation: () => void); 
declare function it(name: string, implementation: () => void); 
declare function describe(name: string, implementation: () => void); 
declare function before(implementation: () => void); 
declare function beforeAll(implementation: () => void); 
declare function beforeEach(implementation: () => void); 
declare function after(implementation: () => void); 
declare function afterEach(implementation: () => void); 
declare function afterAll(implementation: () => void); 


interface IConfig {
  [index: string]: any;
  component: JSX.Element;
  story: string;
  folder: string;
  info: string;
}

declare function config(obj: IConfig);