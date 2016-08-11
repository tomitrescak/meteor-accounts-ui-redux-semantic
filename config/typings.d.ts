declare module 'meteor/tomi:accountsui-semanticui-redux' {
    export class AccountsView extends __React.Component<{}, {}> { }
    export class UserView extends __React.Component<{}, {}> { }
    export function reducer(state: any, action: any): any;

    export interface AccountsUiUser {
        _id: string;
        profile: any;
        isRole(role: string | string[]): boolean;
        isAdmin(): boolean;
    }

    interface IState {
        view?: string;
        error?: string;
        info?: string;
        token?: string;
        user?: any;
    }
}
