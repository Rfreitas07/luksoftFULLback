import { UsersService } from './users.service';
import { UploadAvatarDto } from './upload-avatar.dto';
import { UpdateProfileDto } from './update-profile.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("./entities/user.entity").User | null>;
    getProfileById(userId: number, req: any): Promise<import("./entities/user.entity").User>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto, req: any): Promise<import("./entities/user.entity").User>;
    uploadAvatar(file: any, uploadAvatarDto: UploadAvatarDto): Promise<{
        message: string;
        avatarPath: string;
        user: import("./entities/user.entity").User;
    }>;
}
