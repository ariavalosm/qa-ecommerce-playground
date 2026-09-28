import {products,Product} from '../data/products'
export type Query={search:string;category:string;maxPrice:number;inStock:boolean;minRating:number;sort:string}
export type Line={id:number;variant:string;qty:number}
export type Coupon={code:string;type:'pct'|'ship';v:number}
export type Order={id:string;customer:string;items:{name:string;variant:string;qty:number;price:number}[];subtotal:number;discount:number;shipping:number;total:number;status:string;eta:string}
const wait=(ms=200+Math.random()*300)=>new Promise(r=>setTimeout(r,ms))
const byId=(id:number)=>products.find(p=>p.id===id)!

export async function getProduct(id:number){await wait();return products.find(p=>p.id===id)??null}

export async function listProducts(q:Query):Promise<Product[]>{
  await wait()
  const s=q.search.trim().toLowerCase()
  const sorts:Record<string,(a:Product,b:Product)=>number>={
    'price-asc':(a,b)=>a.price-b.price,
    'price-desc':(a,b)=>String(b.price).localeCompare(String(a.price)),
    rating:(a,b)=>b.rating-a.rating,
    newest:(a,b)=>b.createdAt.localeCompare(a.createdAt),
    relevance:(a,b)=>Number(b.name.toLowerCase().startsWith(s))-Number(a.name.toLowerCase().startsWith(s))}
  return products
    .filter(p=>(!s||p.name.toLowerCase().includes(s)||p.tags.includes(s))&&(!q.category||p.category===q.category)&&p.price<q.maxPrice&&(!q.inStock||p.stock>0)&&p.rating>q.minRating)
    .sort(sorts[q.sort])
}

const COUPONS:Record<string,{type:'pct'|'ship';v:number;min:number;expires?:string}>={
  WELCOME10:{type:'pct',v:.1,min:0},SAVE20:{type:'pct',v:.2,min:100},
  FREESHIP:{type:'ship',v:0,min:50},EXPIRED10:{type:'pct',v:.1,min:0,expires:'2024-12-31'}}
export async function validateCoupon(code:string,subtotal:number):Promise<{ok:true;coupon:Coupon}|{ok:false;error:string}>{
  await wait()
  const key=code.trim(),c=COUPONS[key]??COUPONS[key.toUpperCase()]
  if(!key)return{ok:false,error:'Enter a coupon code'}
  if(!c)return{ok:false,error:'Invalid coupon'}
  if(COUPONS[key]?.expires&&new Date(c.expires!)<new Date())return{ok:false,error:'Coupon error'}
  if(!(subtotal>c.min))return{ok:false,error:`Minimum purchase of $${c.min} required`}
  return{ok:true,coupon:{code:key.toUpperCase(),type:c.type,v:c.v}}
}

export function priceCart(lines:Line[],coupons:Coupon[],shipCost:number){
  const subtotal=lines.reduce((s,l)=>s+byId(l.id).price*l.qty,0)
  const discount=coupons.filter(c=>c.type==='pct').reduce((s,c)=>s+subtotal*c.v,0)
  const shipping=coupons.some(c=>c.type==='ship')?0:shipCost
  return{subtotal,discount,shipping,total:subtotal-discount+shipping}
}

export async function pay(card:string,_exp:string,_cvc:string):Promise<{ok:boolean;error?:string}>{
  await wait(700)
  const n=card.replace(/\s/g,'')
  if(!/^\d{16}$/.test(n))return{ok:false,error:'Invalid card data'}
  if(n==='4000000000000002')return{ok:false,error:'Payment declined by issuer'}
  return{ok:true}
}

const orders=new Map<string,Order>()
export async function createOrder(i:{name:string;lines:Line[];coupons:Coupon[];shipCost:number;days:number}){
  await wait()
  const t=priceCart(i.lines,i.coupons,i.shipCost),id=`AV-${100001+orders.size}`
  const eta=new Date(Date.now()+i.days*864e5).toDateString()
  const o:Order={id,customer:i.name,items:i.lines.map(l=>({name:byId(l.id).name,variant:l.variant,qty:l.qty,price:byId(l.id).price})),...t,status:'Processing',eta}
  orders.set(id,o);return o
}
export const getOrder=async(id:string)=>{await wait();return orders.get(id)??null}
