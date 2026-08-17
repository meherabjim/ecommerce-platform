'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShoppingBag,
} from 'lucide-react';

import { api } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { mergeGuestCartIntoServer } from '@/lib/guest-cart';
import { useI18n } from '@/lib/i18n';


export default function LoginPage(){

  const router = useRouter();
  const {language}=useI18n();


  const [email,setEmail] = useState('');


  const [password,setPassword] = useState('');


  const [show,setShow] = useState(false);

  const [error,setError] = useState('');

  const [loading,setLoading] = useState(false);



  async function handleSubmit(
    e:FormEvent
  ){

    e.preventDefault();

    setError('');

    setLoading(true);


    try{


      const response = await api.post(
        '/auth/login',
        {
          email,
          password
        }
      );


      const data = response.data;


      console.log(
        "LOGIN DATA:",
        data
      );


      const user = data.user;


      if(!user){

        throw new Error(
          "User data missing from login response"
        );

      }



      saveAuth(
        data.accessToken,
        user,
        data.refreshToken
      );

      try { await mergeGuestCartIntoServer(api); } catch { /* keep guest cart if merge fails */ }



      const role =
        String(user.role || '')
        .toUpperCase();



      console.log(
        "USER ROLE:",
        role
      );



      const staffRoles = [

        'SUPER_ADMIN',

        'ADMIN',

        'CATALOG_MANAGER',

        'INVENTORY_MANAGER',

        'ORDER_MANAGER',

        'CUSTOMER_SUPPORT',

        'MARKETING_MANAGER',

        'FINANCE',

      ];




      if(
        staffRoles.includes(role)
      ){

        router.replace(
          '/admin'
        );

        return;

      }



      if(
        role === 'DELIVERY_AGENT'
      ){

        router.replace(
          '/delivery'
        );

        return;

      }



      if(
        role === 'CUSTOMER'
      ){
        const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
        router.replace(next && next.startsWith('/') ? next : '/account');
        return;
      }



      router.replace(
        '/account'
      );


    }


    catch(err:any){


      console.error(
        "LOGIN ERROR:",
        err
      );


      setError(

        err?.response?.data?.message

        ||

        err?.message

        ||

        'Login failed.'

      );


    }


    finally{

      setLoading(false);

    }


  }



  return (

    <main
      className="
      min-h-screen
      bg-gradient-to-br from-[#0b1f45] via-[#1464f4] to-[#7048ff]
      text-slate-950
      lg:grid
      lg:grid-cols-[1.05fr_.95fr]
      "
    >


      <section
        className="
        hidden
        lg:flex
        p-6
        text-white
        "
      >

        <div>

          <h1 className="
          text-5xl
          font-black
          ">

            E-Commerce Platform

          </h1>


          <p className="
          mt-5
          text-white/60
          ">

            Premium shopping • secure checkout • live tracking

          </p>


        </div>


      </section>




      <section
        className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f6f7f9]
        p-5
        "
      >


        <form

          onSubmit={handleSubmit}

          className="
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-6
          "

        >


          <div
            className="
            grid
            h-12
            w-12
            place-items-center
            rounded-xl
            bg-gradient-to-br from-[#0b1f45] via-[#1464f4] to-[#7048ff]
            text-white
            "
          >

            <LockKeyhole/>

          </div>



          <h2
            className="
            mt-5
            text-3xl
            font-black
            "
          >

            {language==='bn'?'সাইন ইন':'Sign in'}

          </h2>




          {
            error &&

            <div
              className="
              mt-5
              rounded-xl
              bg-red-50
              p-3
              text-red-700
              "
            >

              {error}

            </div>

          }





          <label
            className="
            mt-6
            block
            font-bold
            "
          >

            {language==='bn'?'ইমেইল':'Email'}


            <input

              value={email}

              onChange={
                e=>setEmail(
                  e.target.value
                )
              }

              className="
              mt-2
              w-full
              rounded-xl
              border
              p-3
              "

              type="email"

            />


          </label>




          <label
            className="
            mt-5
            block
            font-bold
            "
          >


            {language==='bn'?'পাসওয়ার্ড':'Password'}



            <div
              className="
              relative
              "
            >


              <input


                value={password}


                onChange={
                  e=>setPassword(
                    e.target.value
                  )
                }


                type={
                  show
                  ?
                  "text"
                  :
                  "password"
                }


                className="
                mt-2
                w-full
                rounded-xl
                border
                p-3
                pr-12
                "

              />



              <button

                type="button"

                onClick={
                  ()=>setShow(!show)
                }

                className="
                absolute
                right-3
                top-5
                "

              >

                {
                  show

                  ?

                  <EyeOff size={18}/>

                  :

                  <Eye size={18}/>

                }


              </button>


            </div>


          </label>





          <button

            disabled={loading}

            className="
            mt-7
            flex
            w-full
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-br from-[#0b1f45] via-[#1464f4] to-[#7048ff]
            py-3
            text-white
            "

          >


            <ShoppingBag size={18}/>


            {

              loading

              ?

              "Signing..."

              :

              (language==='bn'?'সাইন ইন':'Sign in')

            }


          </button>
          <div className="mt-4 flex items-center justify-between text-sm"><Link href="/forgot-password" className="font-bold text-blue-600">{language==='bn'?'পাসওয়ার্ড ভুলে গেছেন?':'Forgot password?'}</Link><Link href="/register" className="font-black text-slate-900">{language==='bn'?'অ্যাকাউন্ট তৈরি করুন':'Create account'}</Link></div>
        </form>



      </section>



    </main>

  );

}