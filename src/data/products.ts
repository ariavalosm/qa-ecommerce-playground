export type Product={id:number;name:string;description:string;price:number;compareAt?:number;category:string;image:string;stock:number;rating:number;variants:string[];tags:string[];createdAt:string}
const S=['S','M','L'],C=['Black','White','Blue'],N=['40','41','42','43']
const img=(e:string)=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#eef1f5"/><text x="200" y="185" font-size="110" text-anchor="middle">${e}</text></svg>`)}`
// name, price, compareAt, category, stock, rating, variants, tags, emoji
const raw:[string,number,number,string,number,number,string[],string[],string][]=[
['Classic Cotton Tee',24,0,'Clothing',120,4.2,S,['tee','cotton'],'👕'],
['Wool Blend Sweater',79,99,'Clothing',8,4.6,S,['winter','wool'],'🧥'],
['Slim Fit Jeans',59,0,'Clothing',45,3.9,['30','32','34'],['denim'],'👖'],
['Rain Jacket',110,140,'Clothing',3,4.4,S,['rain','outdoor'],'🧥'],
['Leather Belt',35,0,'Accessories',60,4.0,[],['leather'],'🎀'],
['Aviator Sunglasses',85,0,'Accessories',0,4.5,C,['sun','summer'],'🕶️'],
['Silk Scarf',48,60,'Accessories',14,4.1,C,['silk'],'🧣'],
['Everyday Sneakers',89,0,'Shoes',30,4.3,N,['sneakers','casual'],'👟'],
['Trail Running Shoes',129,159,'Shoes',5,4.7,N,['running','trail'],'🥾'],
['Leather Loafers',149,0,'Shoes',0,4.0,N,['leather','formal'],'👞'],
['Canvas Backpack',65,0,'Bags',40,4.2,C,['backpack','school'],'🎒'],
['Weekender Duffel',120,150,'Bags',2,4.8,['Grey','Olive'],['travel'],'🧳'],
['Crossbody Bag',54,0,'Bags',22,3.8,C,['crossbody'],'👜'],
['Ceramic Mug Set',32,0,'Home',75,4.5,[],['kitchen','ceramic'],'☕'],
['Linen Throw Blanket',68,85,'Home',18,4.6,C,['linen','cozy'],'🛋️'],
['Scented Candle',18,0,'Home',200,4.1,['Vanilla','Cedar'],['candle'],'🕯️'],
['Wireless Earbuds',99,129,'Technology',26,4.4,C,['audio','USB-C'],'🎧'],
['Mechanical Keyboard',145,0,'Technology',9,4.7,['Red','Brown','Blue'],['keyboard','USB-C'],'⌨️'],
['Smart Water Bottle',42,0,'Technology',0,3.7,[],['hydration'],'🍶'],
['Portable Charger 20K',39,49,'Technology',85,4.0,[],['power','USB-C'],'🔋']]
export const products:Product[]=raw.map((r,i)=>({id:i+1,name:r[0],description:`${r[0]} — designed for everyday use. Quality materials, thoughtful details and a fit that lasts.`,price:r[1],compareAt:r[2]||undefined,category:r[3],image:img(r[8]),stock:r[4],rating:r[5],variants:r[6],tags:r[7],createdAt:new Date(2025,0,1+i*17).toISOString().slice(0,10)}))
export const categories=[...new Set(products.map(p=>p.category))]
