export default function Loading(){
  return (
    <div
      style={{
        minHeight:'100vh',
        background:'linear-gradient(180deg,#17283d 0%,#132235 48%,#102033 100%)',
        color:'#f7fbff',
        display:'grid',
        placeItems:'center'
      }}
    >
      <div style={{textAlign:'center'}}>
        <div style={{
          width:44,height:44,borderRadius:'50%',
          border:'4px solid #355675',
          borderTopColor:'#38bdf8',
          margin:'0 auto',
          animation:'neuroSpin .8s linear infinite'
        }}/>
        <p style={{marginTop:14,fontSize:13,fontWeight:800,color:'#b9c9da'}}>
          Loading Neuro Commerce…
        </p>
        <style>{`@keyframes neuroSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
