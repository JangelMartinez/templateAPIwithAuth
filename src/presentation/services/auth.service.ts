import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";


export class AuthService {

    // DI
    constructor() { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });

        if (existUser) throw CustomError.badRequest('Email already exist');

        try {

            const user = new UserModel(registerUserDto);

            // Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();
            // Jwt <--- para mantener la autenticación del usuario

            // Email de confirmación


            const { password, ...userEntity } = UserEntity.fromObject(user);

            return {
                user: userEntity,
                token: 'ABC'
            };

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }

    }


    public async loginUser(loginUserDto: LoginUserDto) {

        // Findoe para verificar si existe
        const user = await UserModel.findOne({ email: loginUserDto.email });

        if (!user) throw CustomError.badRequest('Email o password not correct');

        const isMatching = bcryptAdapter.compare( loginUserDto.password, user.password );

        if (!isMatching) throw CustomError.badRequest('Email o password not correct');

        const { password, ...userEntity} = UserEntity.fromObject(user);

        // Jwt token
        const token = await JwtAdapter.generateToken( { id: user.id });
        if( !token ) throw CustomError.internalServer('Error while creating JWT');

        return {
            user: userEntity,
            token: token
        }

    }
}