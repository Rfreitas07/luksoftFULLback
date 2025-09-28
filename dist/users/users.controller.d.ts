import { UsersService } from './users.service';
import { UploadAvatarDto } from './upload-avatar.dto';
import { UpdateProfileDto } from './update-profile.dto';
import { SaveTimesheetDto } from './timesheet.dto';
import { UpdateWeekStatusDto } from './week-status.dto';
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
    saveTimesheet(req: any, saveTimesheetDto: SaveTimesheetDto): Promise<any>;
    getWeekTimesheet(req: any, weekOffset?: string): Promise<any>;
    updateWeekStatus(req: any, updateWeekStatusDto: UpdateWeekStatusDto): Promise<any>;
    testTimesheet(): Promise<{
        message: string;
        timestamp: Date;
    }>;
}
