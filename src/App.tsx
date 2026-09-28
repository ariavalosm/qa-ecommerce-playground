import {useEffect,useState} from 'react'
import {Product,categories} from './data/products'
import * as api from './api/api'
import type {Line,Coupon,Order} from './api/api'
import './styles.css'

const $=(n:number)=>`$${n.toFixed(2)}`
const go=(p:string)=>{location.hash=p}
function useRoute(){
  const[h,setH]=useState(location.hash.slice(1)||'/')
  useEffect(()=>{const f=()=>setH(location.hash.slice(1)||'/');addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[])
  return h
}

export default function App(){
  const[,page='',arg='']=useRoute().split('/')
  const[cart,setCart]=useState<Line[]>([])
  const[coupons,setCoupons]=useState<Coupon[]>([])
  const add=(id:number,variant:string,qty:number)=>setCart(c=>{
    const l=c.find(x=>x.id===id)
    return l?c.map(x=>x===l?{...x,qty:x.qty+qty}:x):[...c,{id,variant,qty}]})
  return(<>
    <header><a href="#/" className="logo">Avanni Goods</a><a href="#/cart">Cart ({cart.reduce((s,l)=>s+l.qty,0)})</a></header>
    <main>
      {page===''&&<Catalog/>}
      {page==='product'&&<Detail id={+arg} onAdd={add}/>}
      {page==='cart'&&<Cart cart={cart} setCart={setCart} coupons={coupons} setCoupons={setCoupons}/>}
      {page==='checkout'&&<Checkout cart={cart} coupons={coupons} done={()=>{setCart([]);setCoupons([])}}/>}
      {page==='order'&&<Confirmation id={arg}/>}
    </main>
  </>)
}

const init:api.Query={search:'',category:'',maxPrice:1000,inStock:false,minRating:0,sort:'relevance'}
function Catalog(){
  const[q,setQ]=useState(init),[items,setItems]=useState<Product[]|null>(null)
  useEffect(()=>{setItems(null);api.listProducts(q).then(setItems)},[q])
  const set=(k:keyof api.Query,v:string|number|boolean)=>setQ(p=>({...p,[k]:v}))
  return(<div className="layout">
    <aside className="filters">
      <label>Search<input value={q.search} onChange={e=>set('search',e.target.value)} placeholder="Search products"/></label>
      <label>Category<select value={q.category} onChange={e=>set('category',e.target.value)}><option value="">All</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Max price: {$(q.maxPrice)}<input type="range" min={10} max={200} value={Math.min(q.maxPrice,200)} onChange={e=>set('maxPrice',+e.target.value)}/></label>
      <label>Min rating<select value={q.minRating} onChange={e=>set('minRating',+e.target.value)}><option value={0}>Any</option><option value={3}>3+</option><option value={4}>4+</option></select></label>
      <label><span><input type="checkbox" checked={q.inStock} onChange={e=>set('inStock',e.target.checked)}/> In stock only</span></label>
      <label>Sort by<select value={q.sort} onChange={e=>set('sort',e.target.value)}><option value="relevance">Relevance</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Rating</option><option value="newest">Newest</option></select></label>
    </aside>
    <section style={{flex:1}}>
      <h3>Products</h3>
      {items===null?<p>Loading…</p>:items.length===0
        ?<div className="box"><p>No products match your search.</p><button onClick={()=>setQ({...init,search:q.search})}>Clear filters</button></div>
        :<div className="grid">{items.map(p=><Card key={p.id} p={p}/>)}</div>}
    </section>
  </div>)
}

function Card({p}:{p:Product}){
  return(<article className="card">
    <img src={p.image} alt="product"/>
    <div>
      <h3 style={{margin:'0 0 4px',fontSize:16}}><a href={`#/product/${p.id}`}>{p.name}</a></h3>
      <div className="price">{$(p.price)}{p.compareAt&&<s>{$(p.compareAt)}</s>}</div>
      <div className="muted">★ {p.rating}</div>
      {p.stock===0?<span className="tag">Out of stock</span>:p.stock<5&&<span className="tag">Only {p.stock} left</span>}
    </div>
  </article>)
}

function Detail({id,onAdd}:{id:number;onAdd:(id:number,v:string,q:number)=>void}){
  const[p,setP]=useState<Product|null|undefined>(),[v,setV]=useState(''),[qty,setQty]=useState(1)
  useEffect(()=>{setP(undefined);api.getProduct(id).then(r=>{setP(r);setV(r?.variants[0]??'')})},[id])
  if(p===undefined)return<p>Loading…</p>
  if(p===null)return<p className="err">Product not found. <a href="#/">Back to store</a></p>
  return(<div className="detail">
    <img src={p.image} alt={p.name}/>
    <div>
      <h1>{p.name}</h1>
      <p className="price" style={{fontSize:22}}>{$(p.price)}{p.compareAt&&<s>{$(p.compareAt)}</s>}</p>
      <p className="muted">★ {p.rating} · {p.stock===0?'Out of stock':p.stock<5?`Only ${p.stock} left`:'In stock'}</p>
      <p>{p.description}</p>
      {p.variants.length>0&&<label>Option <select value={v} onChange={e=>setV(e.target.value)}>{p.variants.map(x=><option key={x}>{x}</option>)}</select></label>}
      <p className="qty">
        <button className="ghost" aria-label="Decrease" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
        <input aria-label="Quantity" type="number" value={qty} onChange={e=>setQty(+e.target.value)}/>
        <button className="ghost" aria-label="Increase" onClick={()=>setQty(q=>Math.min(10,q+1))}>+</button>
      </p>
      <button disabled={p.stock===0} onClick={()=>{onAdd(p.id,v,qty);go('/cart')}}>Add to cart</button>
    </div>
  </div>)
}

type CartProps={cart:Line[];setCart:React.Dispatch<React.SetStateAction<Line[]>>;coupons:Coupon[];setCoupons:React.Dispatch<React.SetStateAction<Coupon[]>>}
function Cart({cart,setCart,coupons,setCoupons}:CartProps){
  const[code,setCode]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[all,setAll]=useState<Product[]>([])
  useEffect(()=>{import('./data/products').then(m=>setAll(m.products))},[])
  const t=api.priceCart(cart,coupons,0)
  const upd=(i:number,qty:number)=>setCart(c=>c.map((l,j)=>j===i?{...l,qty}:l))
  const apply=async()=>{
    setBusy(true)
    const r=await api.validateCoupon(code,t.subtotal)
    if(!r.ok){setMsg(r.error);return}
    setCoupons(c=>[...c,r.coupon]);setMsg('Coupon applied');setCode('');setBusy(false)
  }
  if(cart.length===0)return<div><h1>Your cart</h1><p>Your cart is empty.</p><a href="#/">Continue shopping</a></div>
  return(<div><h1>Your cart</h1>
    {cart.map((l,i)=>{const p=all.find(x=>x.id===l.id);return(
      <div className="row" key={i}>
        <div className="grow"><strong>{p?.name}</strong>{l.variant&&<span className="muted"> · {l.variant}</span>}<div>{p&&$(p.price)}</div></div>
        <div className="qty">
          <button className="ghost" aria-label="Decrease" onClick={()=>upd(i,l.qty-1)}>−</button>
          <input aria-label="Quantity" type="number" value={l.qty} onChange={e=>upd(i,+e.target.value)}/>
          <button className="ghost" aria-label="Increase" onClick={()=>upd(i,l.qty+1)}>+</button>
        </div>
        <button className="ghost" onClick={()=>setCart(c=>c.filter((_,j)=>j!==i))}>Remove</button>
      </div>)})}
    <p><button className="ghost" onClick={()=>setCart([])}>Clear cart</button></p>
    <div className="box" style={{maxWidth:380}}>
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Coupon code"/> <button disabled={busy} onClick={apply}>Apply</button>
      {msg&&<p className={msg==='Coupon applied'?'ok':'err'}>{msg}</p>}
      {coupons.map(c=><div key={c.code}>{c.code} <button className="ghost" onClick={()=>setCoupons(x=>x.filter(y=>y.code!==c.code))}>×</button></div>)}
      <Totals t={t} note="Shipping calculated at checkout"/>
      <button onClick={()=>go('/checkout')}>Proceed to checkout</button>
    </div>
  </div>)
}

const Totals=({t,note}:{t:ReturnType<typeof api.priceCart>;note?:string})=>(
  <div className="summary"><p>Subtotal: {$(t.subtotal)}</p><p>Discount: −{$(t.discount)}</p><p>Shipping: {note??$(t.shipping)}</p><p><strong>Total: {$(t.total)}</strong></p></div>)

type F=[key:string,label:string,type?:string]
function Step({fields,init,validate,onSubmit,back,cta}:{fields:F[];init:Record<string,string>;validate:(v:Record<string,string>)=>string;onSubmit:(v:Record<string,string>)=>void;back?:()=>void;cta:string}){
  const[v,setV]=useState(init),[err,setErr]=useState('')
  return(<form onSubmit={e=>{e.preventDefault();const m=validate(v);setErr(m);if(!m)onSubmit(v)}}>
    {fields.map(([k,l,t])=>l
      ?<label key={k}>{l}<input type={t??'text'} value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/></label>
      :<input key={k} placeholder={k} value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/>)}
    {err&&<p className="err">{err}</p>}
    <div>{back&&<button type="button" className="ghost" onClick={back}>Back</button>} <button type="submit">{cta}</button></div>
  </form>)
}
const req=(ks:string[])=>(v:Record<string,string>)=>ks.some(k=>!v[k]?.trim())?'Please fill in all fields':''

const SHIP=[{name:'Standard',cost:5,days:6},{name:'Express',cost:15,days:2},{name:'Free shipping',cost:0,days:10}]
function Checkout({cart,coupons,done}:{cart:Line[];coupons:Coupon[];done:()=>void}){
  const[step,setStep]=useState(0),[info,setInfo]=useState<Record<string,string>>({}),[ship,setShip]=useState(SHIP[0]),[busy,setBusy]=useState(false),[err,setErr]=useState('')
  const t=api.priceCart(cart,coupons,ship.cost)
  const next=(d:Record<string,string>)=>{setInfo(i=>({...i,...d}));setStep(s=>s+1)}
  const back=()=>setStep(s=>s-1)
  const submit=async(v:Record<string,string>)=>{
    setBusy(true);setErr('')
    const r=await api.pay(v.card,v.exp,v.cvc)
    if(!r.ok){setErr(r.error??'Payment failed');setBusy(false);return}
    const o=await api.createOrder({name:`${info.first} ${info.last}`,lines:cart,coupons,shipCost:ship.cost,days:ship.days})
    done();go(`/order/${o.id}`)
  }
  return(<div><h1>Checkout</h1>
    <div className="steps">{['Customer','Address','Shipping','Payment'].map((s,i)=>i===step?<b key={s}>{i+1}. {s}</b>:<span key={s} className="muted">{i+1}. {s}</span>)}</div>
    <div className="checkout"><div>
      {step===0&&<Step cta="Continue" init={info} fields={[['first','First name'],['last','Last name'],['email','Email','email'],['phone','']]} validate={v=>req(['first','last','email','phone'])(v)||(!v.email.includes('@')?'Enter a valid email':'')} onSubmit={next}/>}
      {step===1&&<Step cta="Continue" init={{country:'Peru'}} fields={[['country','Country'],['city','City'],['address','Address'],['postal','Postal code']]} validate={req(['country','city','address','postal'])} onSubmit={next} back={back}/>}
      {step===2&&<form onSubmit={e=>{e.preventDefault();setStep(3)}}>
        {SHIP.map(s=><label key={s.name}><span><input type="radio" name="ship" checked={ship===s} onChange={()=>setShip(s)}/> {s.name} — {$(s.cost)} ({s.days} days)</span></label>)}
        <div><button type="button" className="ghost" onClick={back}>Back</button> <button type="submit">Continue</button></div></form>}
      {step===3&&<><p className="muted">Test cards: 4111 1111 1111 1111 (success) · 4000 0000 0000 0002 (declined)</p>
        <Step cta={busy?'Processing…':'Pay now'} init={{}} fields={[['card','Card number'],['exp','Expiry (MM/YY)'],['cvc','CVC']]} validate={req(['card','exp','cvc'])} onSubmit={submit} back={back}/>
        {err&&<p className="err">{err}</p>}</>}
    </div>
    <div className="box summary"><h2 style={{marginTop:0}}>Order summary</h2><Totals t={t}/></div></div>
  </div>)
}

function Confirmation({id}:{id:string}){
  const[o,setO]=useState<Order|null|undefined>()
  useEffect(()=>{api.getOrder(id).then(setO)},[id])
  if(o===undefined)return<p>Loading…</p>
  if(o===null)return<p className="err">Something went wrong.</p>
  return(<div><h1>Thank you, {o.customer}!</h1>
    <p>Order <strong>{o.id}</strong> · Status: {o.status}</p>
    {o.items.map((i,k)=><div className="row" key={k}><span className="grow">{i.name}{i.variant&&` · ${i.variant}`} × {i.qty}</span>{$(i.price*i.qty)}</div>)}
    <Totals t={o}/><p>Estimated delivery: {o.eta}</p><a href="#/">Continue shopping</a></div>)
}
