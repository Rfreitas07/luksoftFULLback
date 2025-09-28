import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
export declare class ProjectsService {
    private projectsRepository;
    constructor(projectsRepository: Repository<Project>);
    findAll(): Promise<Project[]>;
    findById(id: number): Promise<Project>;
}
