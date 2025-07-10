// import { useState, useEffect, createRef, useRef } from "react"
import { useState, useEffect } from "react"
import { GridStack } from "gridstack"
import "./demo.css"
import { Button } from "reactstrap"
import Bar1 from "../iot/modules/utility/chilledwater/bar1/cardlessbar1"

export const Gridstacktest = () => {
  const [grid, setGrid] = useState()
  const [count, setCount] = useState(0)
  const options = {
    // put in gridstack options here
    disableOneColumnMode: true, // for jfiddle small window size
    float: false
  }

  //   const items = [
  //     { x: 0, y: 0, w: 2, h: 2 },
  //     { x: 2, y: 0, w: 2 },
  //     { x: 3, y: 1, h: 2 },
  //     { x: 0, y: 2, w: 2 }
  //   ]

  const addNewWidget = () => {
    // eslint-disable-next-line prefer-const
    // let node = {
    //   x: Math.round(12 * Math.random()),
    //   y: Math.round(5 * Math.random()),
    //   w: Math.round(1 + 3 * Math.random()),
    //   h: Math.round(1 + 3 * Math.random())
    // }
    // node.content = props.content
    grid.el.appendChild(<div></div>)
    grid.makeWidget(<div></div>)
    setCount(count + 1)
    return false
  }
  const addNewNormalWidget = () => {
    // eslint-disable-next-line prefer-const
    let node = {
      x: Math.round(12 * Math.random()),
      y: Math.round(5 * Math.random()),
      w: Math.round(1 + 3 * Math.random()),
      h: Math.round(1 + 3 * Math.random())
    }
    node.content = String(count)
    setCount(count + 1)
    grid.addWidget(node)
    return false
  }

  useEffect(() => {
    setGrid(GridStack.init(options))
  }, [])

  return (
    <div>
      <div>
        <Button class="btn btn-default" onClick={addNewWidget} href="#">
          Add Widget
        </Button>
      </div>
      <div>
        <Button class="btn btn-default" onClick={addNewNormalWidget} href="#">
          Add Normal Widget
        </Button>
      </div>
      <div class="grid-stack">
        <div class="grid-stack-item">
          <div class="grid-stack-item-content">Item 1</div>
        </div>
      </div>
    </div>
  )
}

export default Gridstacktest

// const Item = ({ id }) => <div>{id}</div>

// //
// // Controlled example
// //
// const ControlledStack = ({ items, addItem }) => {
//   const refs = useRef({})
//   const gridRef = useRef()

//   if (Object.keys(refs.current).length !== items.length) {
//     items.forEach(({ id }) => {
//       refs.current[id] = refs.current[id] || createRef()
//     })
//   }

//   useEffect(() => {
//     const grid = gridRef.current
//     grid.batchUpdate()
//     grid.removeAll(false)
//     items.forEach(({ id }) => grid.makeWidget(refs.current[id].current))
//     grid.batchUpdate(false)
//   }, [items])

//   return (
//     <div>
//       <button onClick={addItem}>Add new widget</button>
//       <div className={`grid-stack controlled`}>
//         <div ref={gridRef}></div>
//         {items.map((item) => {
//           return (
//             <div
//               ref={refs.current[item.id]}
//               key={item.id}
//               className={"grid-stack-item"}
//             >
//               <div className="grid-stack-item-content">
//                 <Item {...item} />
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// export const ControlledExample = () => {
//   const [items, setItems] = useState([{ id: "item-1" }, { id: "item-2" }])
//   return (
//     <ControlledStack
//       items={items}
//       addItem={() => setItems([...items, { id: `item-${items.length + 1}` }])}
//     />
//   )
// }

// //
// // Uncontrolled example
// //
// export const UncontrolledExample = () => {
//   const gridRef = useRef()
//   const [state, setState] = useState({
//     count: 0,
//     info: "",
//     items: [
//       { x: 2, y: 1, h: 2 },
//       { x: 2, y: 4, w: 3 },
//       { x: 4, y: 2 },
//       { x: 3, y: 1, h: 2 },
//       { x: 0, y: 6, w: 2, h: 2 }
//     ]
//   })

//   useEffect(() => {
//     gridRef.current =
//       gridRef.current ||
//       GridStack.init(
//         {
//           float: true,
//           cellHeight: "70px",
//           minRow: 1
//         },
//         ".uncontrolled"
//       )
//     const grid = gridRef.current

//     grid.on("dragstop", (event, element) => {
//       const node = element.gridstackNode
//       setState((prevState) => ({
//         ...prevState,
//         info: `you just dragged node #${node.id} to ${node.x},${node.y} – good job!`
//       }))

//       // eslint-disable-next-line prefer-const
//       let timerId
//       window.clearTimeout(timerId)
//       timerId = window.setTimeout(() => {
//         setState((prevState) => ({
//           ...prevState,
//           info: ""
//         }))
//       }, 2000)
//     })
//   }, [])

//   return (
//     <div>
//       <button
//         onClick={() => {
//           const grid = gridRef.current
//           const node = state.items[state.count] || {
//             x: Math.round(12 * Math.random()),
//             y: Math.round(5 * Math.random()),
//             w: Math.round(1 + 3 * Math.random()),
//             h: Math.round(1 + 3 * Math.random())
//           }
//           node.id = node.content = String(state.count)
//           setState((prevState) => ({
//             ...prevState,
//             count: prevState.count + 1
//           }))
//           grid.addWidget(node)
//         }}
//       >
//         Add Widget
//       </button>
//       <div>{JSON.stringify(state)}</div>
//       <section class="grid-stack uncontrolled"></section>
//     </div>
//   )
// }
