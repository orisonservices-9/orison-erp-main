import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { AcademicService } from './academic.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class AcademicController {
  constructor(@Inject(AcademicService) private readonly academic: AcademicService) {}

  @All('academic-structure')
  academic0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-structure/*')
  academic0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-structure/*/*')
  academic0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-structure/*/*/*')
  academic0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-year-change-request')
  academic1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-year-change-request/*')
  academic1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-year-change-request/*/*')
  academic1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-year-change-request/*/*/*')
  academic1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-intelligence')
  academic2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-intelligence/*')
  academic2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-intelligence/*/*')
  academic2_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('academic-intelligence/*/*/*')
  academic2_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('attendance')
  academic3_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('attendance/*')
  academic3_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('attendance/*/*')
  academic3_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('attendance/*/*/*')
  academic3_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('exams')
  academic4_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('exams/*')
  academic4_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('exams/*/*')
  academic4_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('exams/*/*/*')
  academic4_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('results')
  academic5_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('results/*')
  academic5_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('results/*/*')
  academic5_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('results/*/*/*')
  academic5_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('marks')
  academic6_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('marks/*')
  academic6_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('marks/*/*')
  academic6_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('marks/*/*/*')
  academic6_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('report-card')
  academic7_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('report-card/*')
  academic7_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('report-card/*/*')
  academic7_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('report-card/*/*/*')
  academic7_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('homework')
  academic8_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('homework/*')
  academic8_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('homework/*/*')
  academic8_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('homework/*/*/*')
  academic8_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('timetable-periods')
  academic9_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('timetable-periods/*')
  academic9_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('timetable-periods/*/*')
  academic9_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('timetable-periods/*/*/*')
  academic9_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('curriculum-units')
  academic10_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('curriculum-units/*')
  academic10_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('curriculum-units/*/*')
  academic10_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('curriculum-units/*/*/*')
  academic10_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('classroom-observations')
  academic11_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('classroom-observations/*')
  academic11_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('classroom-observations/*/*')
  academic11_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('classroom-observations/*/*/*')
  academic11_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('interventions')
  academic12_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('interventions/*')
  academic12_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('interventions/*/*')
  academic12_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('interventions/*/*/*')
  academic12_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-health-dashboard')
  academic13_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-health-dashboard/*')
  academic13_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-health-dashboard/*/*')
  academic13_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-health-dashboard/*/*/*')
  academic13_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teaching')
  academic14_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teaching/*')
  academic14_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teaching/*/*')
  academic14_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teaching/*/*/*')
  academic14_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('settings')
  academic15_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('settings/*')
  academic15_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.academic.handle(request);
  }
}
