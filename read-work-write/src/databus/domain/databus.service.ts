import { Injectable, Logger } from "@nestjs/common";
import { UnhandledExceptionBus } from "@nestjs/cqrs";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class DataBusDomainService {
    private destroy$ = new Subject<void>();

    constructor(private unhandledExceptionsBus: UnhandledExceptionBus, private logger: Logger) {
        this.unhandledExceptionsBus
            .pipe(takeUntil(this.destroy$))
            .subscribe((exceptionInfo) => {
                this.logger.error('DataBus Exception', exceptionInfo);
                process.exit(1);
            });
    }

    onModuleDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}