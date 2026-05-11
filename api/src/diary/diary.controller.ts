import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { DiaryService } from "./diary.service";
import { getDiaryEntriesSchema } from "../../../shared/diary.schema";
import { createZodDto } from "nestjs-zod";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class GetDiaryEntriesDto
extends createZodDto(getDiaryEntriesSchema) {}

@Controller('diary')
export class DiaryController {

    constructor(
        private readonly diaryService: DiaryService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getDiaryEntries(
        @Query() param: GetDiaryEntriesDto,
        @Req() req
    ) {
        console.log(req.user);
        return this.diaryService.getDiaryEntries(
            param,
            req.user.id
        );
    }
}