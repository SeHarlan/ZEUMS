import { P } from '@/components/typography/Typography';
import { LinkButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HOME } from '@/constants/clientRoutes';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';


export default function VerifyRequestPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center ">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-xl">Magic link sent!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Click the link in the email to complete your sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-sm ">
        <div className="bg-muted dark:bg-blue-950/20 border rounded-lg p-4">
          
          <CheckCircle className="size-6 mx-auto mb-2" />
          <P className='mb-1'>Didn&apos;t receive the email?</P>
          <P>
            Check your spam folder or try signing in again with a different
            email address.
          </P>
         
        </div>
        <P className="text-muted-foreground">
          The magic link will expire in 24 hours for security.
        </P>

        <LinkButton href={HOME} className="w-full">
          <ArrowLeft />
          Go Home
        </LinkButton>
      </CardContent>
    </Card>
  );
}
