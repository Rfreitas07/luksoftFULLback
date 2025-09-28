import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }
    
    return project;
  }
}