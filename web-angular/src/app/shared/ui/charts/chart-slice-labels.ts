import type { Plugin } from 'chart.js';
import type { ChartDefinition } from './chart.types';

/** Native Chart.js has no outside-slice labels; keep this bounded gap in Shared. */
export function sliceLabelPlugin(definition:ChartDefinition,color:string,fontFamily:string,rtl:boolean):Plugin{
 return {id:'erp-slice-labels',afterDatasetsDraw(chart){
  if(definition.kind!=='pie'||!definition.sliceLabels)return;
  const values=definition.series[0].values,total=values.reduce((sum,value,index)=>sum+(chart.getDataVisibility(index)?value:0),0);
  if(total<=0)return;
  const {ctx,width,height}=chart,size=width<400?10:12;
  ctx.save();ctx.font=`${size}px ${fontFamily}`;ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.textBaseline='middle';ctx.direction=rtl?'rtl':'ltr';
  for(const [index,element] of chart.getDatasetMeta(0).data.entries()){
   const value=values[index];if(!value||!chart.getDataVisibility(index))continue;
   const arc=element as unknown as {x:number;y:number;startAngle:number;endAngle:number;outerRadius:number};
   const angle=(arc.startAngle+arc.endAngle)/2,side=Math.cos(angle)>=0?1:-1;
   const edgeX=arc.x+Math.cos(angle)*arc.outerRadius,edgeY=arc.y+Math.sin(angle)*arc.outerRadius;
   const maxWidth=Math.max(36,width/2-arc.outerRadius-17),words=`${definition.labels[index]} (${(value/total*100).toFixed(1)}%)`.split(/\s+/),lines:string[]=[];
   let line='';for(const word of words){const candidate=line?line+' '+word:word;if(line&&ctx.measureText(candidate).width>maxWidth){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);
   const measured=Math.min(maxWidth,Math.max(...lines.map(text=>ctx.measureText(text).width)));
   const textX=side>0?Math.min(width-3,arc.x+arc.outerRadius+14+measured):Math.max(3,arc.x-arc.outerRadius-14-measured);
   const lineHeight=size+3,blockHeight=Math.min(lines.length,4)*lineHeight;
   const centerY=Math.max(blockHeight/2+5,Math.min(height-blockHeight/2-25,edgeY));
   ctx.beginPath();ctx.moveTo(edgeX,edgeY);ctx.lineTo(edgeX+side*6,centerY);ctx.lineTo(side>0?textX-measured-3:textX+measured+3,centerY);ctx.stroke();
   ctx.textAlign=side>0?'right':'left';for(const [offset,text] of lines.slice(0,4).entries())ctx.fillText(text,textX,centerY-blockHeight/2+lineHeight*(offset+.5),maxWidth);
  }
  ctx.restore();
 }};
}
