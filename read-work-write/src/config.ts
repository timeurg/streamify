export const runTimeConfiguration = {
    NatsOutputHighWaterMark: process.env['NATS_OUT_HWM'] ? // in Kb
        Number.parseInt(process.env['NATS_OUT_HWM']) * 1024
        : 500*1024, // depends on NATS config max payload
}