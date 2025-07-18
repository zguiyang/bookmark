import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({
      required_error: '用户名不能为空',
    })
    .max(50, '用户名称不能超过50个字符'),
  nickname: z.string().max(100, '昵称不能超过100个字符').optional(),
  email: z.string().min(1, '邮箱不能为空').email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码长度至少 6位')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, '密码必须包含字母和数字'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
