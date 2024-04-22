import { Injectable } from "@nestjs/common";
import { CommandBus, UnhandledExceptionBus } from "@nestjs/cqrs";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class AppService {
    private destroy$ = new Subject<void>();

    constructor(private unhandledExceptionsBus: UnhandledExceptionBus) {
        this.unhandledExceptionsBus
            .pipe(takeUntil(this.destroy$))
            .subscribe((exceptionInfo) => {
                console.error(exceptionInfo);
                process.exit(1);
            });
    }

    onModuleDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}