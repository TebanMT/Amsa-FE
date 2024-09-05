import { Empresa } from './empresa';

export class User {
    usuario_id?: String;
	usuario_empresa_id?: String;
	usuario_nombre?: String;
	usuario_apellido_m?: String;
	usuario_apellido_p?: String;
	usuario_correo?: String;
	usuario_nombre_usuario?: String;
	usuario_password?: String;
	usuario_rol_id?: number;
	Empresa?: Empresa;
    token?: string;
	nombre: String;
	apellido_p: string;
	apellido_m: string;
}